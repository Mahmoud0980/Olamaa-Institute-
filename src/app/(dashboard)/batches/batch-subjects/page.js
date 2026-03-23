"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Edit, Trash2, ArrowRight } from "lucide-react";

import DataTable from "@/components/common/DataTable";
import Breadcrumb from "@/components/common/Breadcrumb";
import PrintExportActions from "@/components/common/PrintExportActions";
import ActionsRow from "@/components/common/ActionsRow";

import AddBatchSubjectModal from "../components/AddBatchSubjectModal";

const MOCK_BATCH_SUBJECTS = [
  {
    id: 1,
    subject_name: "رياضيات",
    teacher_name: "الاء",
    max_mark: 200,
    min_mark: 200,
    quizzes_count: 4,
    academic_year: "2024-2025",
  },
  {
    id: 2,
    subject_name: "جغرافيا",
    teacher_name: "سنا",
    max_mark: 600,
    min_mark: 600,
    quizzes_count: 6,
    academic_year: "2024-2025",
  },
  {
    id: 3,
    subject_name: "عربي",
    teacher_name: "روان",
    max_mark: 700,
    min_mark: 700,
    quizzes_count: 3,
    academic_year: "2024-2025",
  },
  {
    id: 4,
    subject_name: "فيزياء",
    teacher_name: "رند",
    max_mark: 800,
    min_mark: 800,
    quizzes_count: 2,
    academic_year: "2024-2025",
  },
  {
    id: 5,
    subject_name: "تاريخ",
    teacher_name: "ريماس",
    max_mark: 300,
    min_mark: 300,
    quizzes_count: 9,
    academic_year: "2024-2025",
  },
  {
    id: 6,
    subject_name: "كيمياء",
    teacher_name: "ميس",
    max_mark: 400,
    min_mark: 400,
    quizzes_count: 8,
    academic_year: "2024-2025",
  },
  {
    id: 7,
    subject_name: "ديانة",
    teacher_name: "هبة",
    max_mark: 200,
    min_mark: 200,
    quizzes_count: 6,
    academic_year: "2024-2025",
  },
  {
    id: 8,
    subject_name: "عربي",
    teacher_name: "دينا",
    max_mark: 100,
    min_mark: 100,
    quizzes_count: 5,
    academic_year: "2024-2025",
  },
  {
    id: 9,
    subject_name: "رياضيات",
    teacher_name: "إسراء",
    max_mark: 200,
    min_mark: 200,
    quizzes_count: 2,
    academic_year: "2024-2025",
  },
  {
    id: 10,
    subject_name: "فيزياء",
    teacher_name: "ليلاس",
    max_mark: 300,
    min_mark: 300,
    quizzes_count: 1,
    academic_year: "2024-2025",
  },
  {
    id: 11,
    subject_name: "كيمياء",
    teacher_name: "تالين",
    max_mark: 400,
    min_mark: 400,
    quizzes_count: 6,
    academic_year: "2024-2025",
  },
];

export default function BatchSubjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchName = searchParams.get("batch") || "علمي بنات";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const columns = [
    { header: "المادة", key: "subject_name" },
    { header: "المدرس", key: "teacher_name" },
    { header: "العلامة العظمى", key: "max_mark" },
    { header: "العلامة الدنيا", key: "min_mark" },
    { header: "عدد المذاكرات في الاسبوع", key: "quizzes_count" },
  ];

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen p-4 md:p-6 bg-[#fcfcfd] flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-800">
            مواد الدورة: {batchName}
          </h1>
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="h-[40px] px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
          >
            <ArrowRight size={16} />
            <span>رجوع</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ActionsRow
          addLabel="إضافة مادة"
          onAdd={handleAdd}
          viewLabel=""
          showSelectAll={true}
          isAllSelected={selectedIds.length === MOCK_BATCH_SUBJECTS.length}
          onToggleSelectAll={() =>
            setSelectedIds(
              selectedIds.length === MOCK_BATCH_SUBJECTS.length
                ? []
                : MOCK_BATCH_SUBJECTS.map((s) => String(s.id)),
            )
          }
        />

        <div className="flex items-center gap-2">
          <PrintExportActions
            data={MOCK_BATCH_SUBJECTS}
            selectedIds={selectedIds}
            columns={[
              { header: "#", key: "id" },
              { header: "المادة", key: "subject_name" },
              { header: "المدرس", key: "teacher_name" },
              { header: "العلامة العظمى", key: "max_mark" },
              { header: "العلامة الدنيا", key: "min_mark" },
              { header: "المذاكرات", key: "quizzes_count" },
            ]}
            title={`مواد دورة ${batchName}`}
            filename={`مواد-${batchName}`}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={MOCK_BATCH_SUBJECTS}
        columns={columns}
        pageSize={10}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        renderActions={(row) => (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="text-[#22C55E] hover:opacity-70 transition p-1"
              title="تعديل"
            >
              <Edit size={18} />
            </button>
            <button
              className="text-[#EF4444] hover:opacity-70 transition p-1"
              title="حذف"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      />

      {/* Add/Edit Modal */}
      <AddBatchSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject={selectedSubject}
        batchName={batchName}
      />
    </div>
  );
}
