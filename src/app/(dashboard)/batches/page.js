"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Users,
  MoveLeft,
  Archive,
  EyeOff,
  Layers3,
  CheckCircle2,
} from "lucide-react";

import ActionsRow from "@/components/common/ActionsRow";
import Breadcrumb from "@/components/common/Breadcrumb";
import PrintExportActions from "@/components/common/PrintExportActions";
import DashboardButton from "@/components/common/DashboardButton";
import SearchableSelect from "@/components/common/SearchableSelect";

import BatchesTable from "./components/BatchesTable";

/* ================= Mock Data ================= */

const MOCK_BATCHES = [
  {
    id: 1,
    name: "علمي بنات",
    student_name: "أحمد السيد",
    institute_branch: { name: "الفرع الرئيسي" },
    academic_branch: { name: "بكالوريا علمي" },
    class_room: { name: "قاعة 1" },
    start_date: "2025-02-03",
    end_date: "2025-06-20",
    gender_type: "female",
    employee_name: "سامر",
    note: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    students_count: 334,
    subjects_count: 12,
    employees_count: 13,
    is_completed: false,
    is_hidden: false,
    is_archived: false,
  },
  {
    id: 2,
    name: "علمي شباب",
    student_name: "أحمد السيد",
    institute_branch: { name: "الفرع الرئيسي" },
    academic_branch: { name: "بكالوريا علمي" },
    class_room: { name: "قاعة 2" },
    start_date: "2025-03-03",
    end_date: "2025-07-01",
    gender_type: "male",
    employee_name: "أحمد",
    note: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    students_count: 280,
    subjects_count: 11,
    employees_count: 9,
    is_completed: false,
    is_hidden: true,
    is_archived: false,
  },
  {
    id: 3,
    name: "تاسع بنات",
    student_name: "لينا خالد",
    institute_branch: { name: "فرع المزة" },
    academic_branch: { name: "تاسع" },
    class_room: { name: "قاعة 3" },
    start_date: "2025-04-03",
    end_date: "2025-08-15",
    gender_type: "female",
    employee_name: "آلاء",
    note: "شعبة صباحية",
    students_count: 198,
    subjects_count: 8,
    employees_count: 7,
    is_completed: false,
    is_hidden: false,
    is_archived: true,
  },
  {
    id: 4,
    name: "تاسع شباب",
    student_name: "محمد علي",
    institute_branch: { name: "فرع المزة" },
    academic_branch: { name: "تاسع" },
    class_room: { name: "قاعة 4" },
    start_date: "2025-05-03",
    end_date: "2025-09-10",
    gender_type: "male",
    employee_name: "محمد",
    note: "شعبة مسائية",
    students_count: 150,
    subjects_count: 7,
    employees_count: 5,
    is_completed: true,
    is_hidden: false,
    is_archived: false,
  },
  {
    id: 5,
    name: "أدبي بنات",
    student_name: "سارة محمد",
    institute_branch: { name: "الفرع الرئيسي" },
    academic_branch: { name: "بكالوريا أدبي" },
    class_room: { name: "قاعة 5" },
    start_date: "2025-06-03",
    end_date: "2025-10-12",
    gender_type: "female",
    employee_name: "علي",
    note: "متابعة أسبوعية",
    students_count: 175,
    subjects_count: 9,
    employees_count: 6,
    is_completed: false,
    is_hidden: false,
    is_archived: false,
  },
];

/* ================= Helpers ================= */

const getStatusLabel = (b) => {
  if (b.is_completed) return "مكتملة";
  if (b.is_hidden) return "مخفية";
  if (b.is_archived) return "مؤرشفة";
  return "نشطة";
};

export default function BatchesPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeView, setActiveView] = useState("all"); // all | hidden | archived | completed

  const studentOptions = useMemo(() => {
    const names = [
      ...new Set(MOCK_BATCHES.map((b) => b.student_name).filter(Boolean)),
    ];
    return names.map((name) => ({
      value: name,
      label: name,
    }));
  }, []);

  const batchOptions = useMemo(() => {
    const names = [...new Set(MOCK_BATCHES.map((b) => b.name).filter(Boolean))];
    return names.map((name) => ({
      value: name,
      label: name,
    }));
  }, []);

  const rows = useMemo(() => {
    return MOCK_BATCHES.filter((row) => {
      const matchStudent =
        !selectedStudent ||
        String(row.student_name) === String(selectedStudent);

      const matchBatch =
        !selectedBatch || String(row.name) === String(selectedBatch);

      const matchView =
        activeView === "all"
          ? true
          : activeView === "hidden"
            ? row.is_hidden
            : activeView === "archived"
              ? row.is_archived
              : activeView === "completed"
                ? row.is_completed
                : true;

      return matchStudent && matchBatch && matchView;
    });
  }, [selectedStudent, selectedBatch, activeView]);

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedStudent, selectedBatch, activeView]);

  const stats = useMemo(() => {
    return {
      total: MOCK_BATCHES.length,
      hidden: MOCK_BATCHES.filter((b) => b.is_hidden).length,
      archived: MOCK_BATCHES.filter((b) => b.is_archived).length,
      completed: MOCK_BATCHES.filter((b) => b.is_completed).length,
    };
  }, []);

  const firstRow = rows[0] || MOCK_BATCHES[0] || {};

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen p-4 md:p-6 flex flex-col gap-6 bg-[#fcfcfd]"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex flex-col gap-1 shrink-0">
          <h1 className="text-xl font-bold text-gray-800">الدورات</h1>
          <Breadcrumb />
        </div>

        <div className="w-full xl:w-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0 sm:min-w-[230px]">
            <SearchableSelect
              label="اسم الطالب"
              value={selectedStudent}
              onChange={setSelectedStudent}
              options={[{ value: "", label: "كل الطلاب" }, ...studentOptions]}
              allowClear
              placeholder="اختر الطالب"
            />
          </div>

          <div className="min-w-0 sm:min-w-[230px]">
            <SearchableSelect
              label="الشعبة"
              value={selectedBatch}
              onChange={setSelectedBatch}
              options={[{ value: "", label: "كل الشعب" }, ...batchOptions]}
              allowClear
              placeholder="اختر الشعبة"
            />
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="w-full xl:w-auto">
          <ActionsRow
            showSelectAll
            viewLabel=""
            addLabel="إضافة دورة"
            isAllSelected={isAllSelected}
            onToggleSelectAll={() =>
              setSelectedIds(isAllSelected ? [] : rows.map((r) => String(r.id)))
            }
            onAdd={() => {}}
            extraButtons={[
              {
                label: "عرض الدورات",
                icon: <Layers3 size={15} />,
                color: activeView === "all" ? "green" : "gray",
                onClick: () => setActiveView("all"),
              },
              {
                label: "عرض الدورات المخفية",
                icon: <EyeOff size={15} />,
                color: activeView === "hidden" ? "green" : "gray",
                onClick: () => setActiveView("hidden"),
              },
              {
                label: "عرض الدورات المؤرشفة",
                icon: <Archive size={15} />,
                color: activeView === "archived" ? "green" : "gray",
                onClick: () => setActiveView("archived"),
              },
              {
                label: "الدورات المكتملة",
                icon: <CheckCircle2 size={15} />,
                color: activeView === "completed" ? "green" : "gray",
                onClick: () => setActiveView("completed"),
              },
            ]}
          />
        </div>

        <div className="w-full xl:w-auto flex flex-wrap items-center gap-2">
          <PrintExportActions
            data={rows}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم الشعبة", key: "name" },
              { header: "اسم الطالب", key: "student_name" },
              {
                header: "الفرع",
                key: "institute_branch",
                render: (val) => val?.name || "—",
              },
              {
                header: "الفرع الأكاديمي",
                key: "academic_branch",
                render: (val) => val?.name || "—",
              },
              { header: "تاريخ البداية", key: "start_date" },
              { header: "تاريخ النهاية", key: "end_date" },
              {
                header: "الحالة",
                key: "id",
                render: (_, row) => getStatusLabel(row),
              },
            ]}
            title="قائمة الشعب"
            filename="الشعب"
          />

          <button
            type="button"
            onClick={() => {}}
            className="h-[38px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition inline-flex items-center gap-2"
          >
            <MoveLeft size={16} />
            <span>نقل</span>
          </button>
        </div>
      </div>

      {/* Stats + cards */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-4">
        <div className="2xl:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF5FD] border border-[#F1E4F6] p-5 rounded-[24px] shadow-sm relative overflow-hidden min-h-[190px] flex">
            {/* Bottom-left white curve & button */}
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white rounded-full"></div>
            <button
              onClick={() => router.push(`/batches/batch-subjects?batch=${firstRow?.name}`)}
              className="absolute bottom-4 left-4 w-14 h-14 rounded-full bg-[#8A1654] text-white flex items-center justify-center hover:bg-[#741046] transition text-2xl shadow-md z-20"
            >
              ↗
            </button>

            {/* Right Group: Icon, Text, Avatars (Appears on Right in RTL) */}
            <div className="relative z-10 flex-1 flex flex-col items-start text-right">
              <div className="w-12 h-12 rounded-xl bg-[#8A1654] text-white flex items-center justify-center shrink-0 mb-3 shadow-[0_4px_10px_rgba(138,22,84,0.3)]">
                <BookOpen size={22} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                مواد الدورة
              </h3>
              <p className="text-sm text-gray-500 mb-4 max-w-[200px] leading-relaxed">
                عرض المواد الدراسية الخاصة بهذه الدورة
              </p>
            </div>

            {/* Left Group: Number (Appears on Left in RTL) */}
            <div className="relative z-10 flex flex-col justify-start items-center w-24 shrink-0">
              <div className="text-3xl font-bold text-gray-900 mt-6">
                {firstRow?.subjects_count || 0}
              </div>
            </div>
          </div>

          <div className="bg-[#FAF5FD] border border-[#F1E4F6] p-5 rounded-[24px] shadow-sm relative overflow-hidden min-h-[190px] flex">
            {/* Bottom-left white curve & button */}
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white rounded-full"></div>
            <button
              onClick={() => router.push(`/batches/students?batch=${firstRow?.name}`)}
              className="absolute bottom-4 left-4 w-14 h-14 rounded-full bg-[#8A1654] text-white flex items-center justify-center hover:bg-[#741046] transition text-2xl shadow-md z-20"
            >
              ↗
            </button>

            {/* Right Group: Icon, Text, Avatars (Appears on Right in RTL) */}
            <div className="relative z-10 flex-1 flex flex-col items-start text-right">
              <div className="w-12 h-12 rounded-xl bg-[#8A1654] text-white flex items-center justify-center shrink-0 mb-3 shadow-[0_4px_10px_rgba(138,22,84,0.3)]">
                <Users size={22} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                طلاب الدورة
              </h3>
              <p className="text-sm text-gray-500 mb-4 max-w-[200px] leading-relaxed">
                عرض الطلاب الذين ينتموا بهذه الدورة
              </p>
            </div>

            {/* Left Group: Number (Appears on Left in RTL) */}
            <div className="relative z-10 flex flex-col justify-start items-center w-24 shrink-0">
              <div className="text-3xl font-bold text-gray-900 mt-6">
                {firstRow?.students_count || 0}
              </div>
            </div>
          </div>
        </div>

        {/* small stat cards */}
        <div className="2xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-1 gap-3">
          <div
            className="flex flex-col justify-between rounded-2xl bg-white px-5 py-4 shadow-sm relative overflow-hidden min-h-[95px]"
            style={{
              background:
                "radial-gradient(120px 120px at 90% 10%, rgba(16,163,69,0.15), transparent 60%)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xl font-semibold text-gray-900">
                {stats.completed}{" "}
                <span className="text-base font-semibold">دورة</span>
              </div>
              <Image
                src="/greenGlobe.svg"
                alt="completed"
                width={20}
                height={20}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">مكتملة</div>
          </div>

          <div
            className="flex flex-col justify-between rounded-2xl bg-white px-5 py-4 shadow-sm relative overflow-hidden min-h-[95px]"
            style={{
              background:
                "radial-gradient(120px 120px at 90% 10%, rgba(244,114,182,0.14), transparent 60%)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xl font-semibold text-gray-900">
                {firstRow?.employees_count || 0}{" "}
                <span className="text-base font-semibold">مدرس</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#BE185D] font-bold text-sm">
                +
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">المدرسين</div>
          </div>
        </div>
      </div>

      {/* Table title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-700">
          معلومات الدورة ({rows.length})
        </h3>
      </div>

      {/* Table */}
      <BatchesTable
        batches={rows}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}
