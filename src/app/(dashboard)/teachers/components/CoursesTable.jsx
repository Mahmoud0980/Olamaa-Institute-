"use client";

import { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";
import DataTable from "@/components/common/DataTable";
import { useGetTeacherBatchesDetailsQuery } from "@/store/services/teachersApi";

const TABS = [
  { key: "all", label: "الكل" },
  { key: "batches", label: "الشعب" },
  { key: "subjects", label: "المواد" },
];

const PAGE_SIZE = 4;

export default function CoursesTable({ selectedTeacher, onBack }) {
  const teacherId = selectedTeacher?.id;
  const [tab, setTab] = useState("all");

  useEffect(() => {
    setTab("all");
  }, [teacherId]);

  // ===== Query 1: ALL (for all + batches + mapping) =====
  const {
    data: allData,
    isLoading: allLoading,
    isFetching: allFetching,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "all" } : undefined,
    { skip: !teacherId, refetchOnMountOrArgChange: true },
  );

  const allBatches = Array.isArray(allData?.data)
    ? allData.data
    : Array.isArray(allData)
      ? allData
      : [];

  // ===== Build subject -> batches map =====
  const subjectToBatchesMap = useMemo(() => {
    const map = new Map();
    for (const b of allBatches) {
      const batchName = b?.batch_name || b?.name || "—";
      const subjects = b?.subjects || [];
      for (const s of subjects) {
        const sid = s?.subject_id;
        if (!sid) continue;
        if (!map.has(sid)) map.set(sid, new Set());
        map.get(sid).add(batchName);
      }
    }
    return map;
  }, [allBatches]);

  // ===== Query 2: SUBJECTS (teacher subjects list) =====
  const {
    data: subjectsData,
    isLoading: subjectsLoading,
    isFetching: subjectsFetching,
  } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    {
      skip: !teacherId || tab !== "subjects",
      refetchOnMountOrArgChange: true,
    },
  );

  const teacherSubjects = Array.isArray(subjectsData?.data)
    ? subjectsData.data
    : Array.isArray(subjectsData)
      ? subjectsData
      : [];

  const loadingNow =
    !teacherId ||
    allLoading ||
    allFetching ||
    (tab === "subjects" && (subjectsLoading || subjectsFetching));

  const columns = useMemo(() => {
    if (tab === "all") {
      return [
        { 
          header: "الشعبة", 
          key: "batch_name",
          render: (val, row) => val || row?.name || "—" 
        },
        { 
          header: "القاعة", 
          key: "class_room", 
          render: (val) => val?.name || "—" 
        },
        { 
          header: "المواد", 
          key: "subjects", 
          render: (val) => (val?.length > 0 ? val.map((s) => s.subject_name).join("، ") : "—") 
        },
        { 
          header: "الفترة", 
          key: "start_date", 
          className: "text-gray-600 text-xs",
          render: (_, row) => `${row?.start_date || "—"} → ${row?.end_date || "—"}` 
        },
      ];
    }
    if (tab === "batches") {
      return [
        { 
          header: "الشعبة", 
          key: "batch_name",
          render: (val, row) => val || row?.name || "—" 
        },
        { 
          header: "من", 
          key: "start_date" 
        },
        { 
          header: "إلى", 
          key: "end_date" 
        },
      ];
    }
    // subjects tab
    return [
      { 
        header: "المادة", 
        key: "subject", 
        render: (val) => val?.name || "—" 
      },
      { 
        header: "الشُّعب", 
        key: "subject", 
        render: (val) => {
          const sid = val?.id;
          const bNames = sid ? Array.from(subjectToBatchesMap.get(sid) || []) : [];
          return bNames.length > 0 ? bNames.join(" / ") : "—";
        }
      },
    ];
  }, [tab, subjectToBatchesMap]);

  const dataForTable = useMemo(() => {
    if (tab === "all") return allBatches;
    if (tab === "batches") return allBatches;
    return teacherSubjects;
  }, [tab, allBatches, teacherSubjects]);

  if (!selectedTeacher) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-4">تفاصيل المدرّس</h3>
        <p className="text-gray-500">يرجى اختيار مدرس لعرض البيانات</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 relative">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-3 left-3 w-9 h-9 rounded-full text-gray-700 inline-flex items-center justify-center"
        title="اغلاق"
      >
        <X size={18} />
      </button>

      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold">تفاصيل {selectedTeacher?.name}</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 justify-start">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm border transition ${
              tab === t.key
                ? "bg-pink-50 border-pink-200 text-[#6F013F]"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable
        data={dataForTable}
        columns={columns}
        isLoading={loadingNow}
        showCheckbox={false}
        pageSize={PAGE_SIZE}
        emptyMessage={
          tab === "all" ? "لا يوجد بيانات مرتبطة بهذا المدرس" :
          tab === "batches" ? "لا يوجد شعب مرتبطة بهذا المدرس" :
          "لا يوجد مواد مرتبطة بهذا المدرس"
        }
      />
    </div>
  );
}
