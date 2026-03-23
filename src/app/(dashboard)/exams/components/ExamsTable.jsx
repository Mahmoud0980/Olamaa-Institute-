"use client";

import { useMemo } from "react";
import DataTable from "@/components/common/DataTable";
import Image from "next/image";

const getExamId = (r) => r?.id ?? r?.exam_id ?? r?.examId ?? null;

const rowId = (r) =>
  String(
    getExamId(r) ??
      `${r?.name ?? "exam"}-${r?.exam_date ?? "d"}-${r?.exam_time ?? "t"}-${r?.exam_type ?? "type"}`,
  );

const timeLabel = (t) => (t ? String(t).slice(0, 5) : "—");

function StatusChip({ value }) {
  const s = String(value ?? "").toLowerCase();

  const base = "px-2 py-0.5 text-xs rounded-full inline-block";
  if (s === "completed")
    return <span className={`${base} bg-green-100 text-green-700`}>مكتمل</span>;
  if (s === "scheduled")
    return <span className={`${base} bg-blue-100 text-blue-700`}>مجدول</span>;
  if (s === "cancelled" || s === "canceled")
    return <span className={`${base} bg-red-100 text-red-700`}>ملغى</span>;

  return (
    <span className={`${base} bg-gray-100 text-gray-700`}>{value ?? "—"}</span>
  );
}

export default function ExamsTable({
  rows = [],
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { header: "اسم المذاكرة", key: "name" },
    { header: "التاريخ", key: "exam_date" },
    { header: "نوع الامتحان", key: "exam_type" },
    { 
      header: "الوقت", 
      key: "exam_time",
      render: (val) => timeLabel(val)
    },
    { header: "العلامة العظمى", key: "total_marks" },
    { header: "علامة النجاح", key: "passing_marks" },
    { 
      header: "الحالة", 
      key: "status",
      render: (val) => <StatusChip value={val} />
    },
  ], []);

  const renderActions = (row) => {
    const examId = getExamId(row);
    const disabledActions = !examId;

    return (
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => onDelete?.(row)}
          disabled={disabledActions}
          className={disabledActions ? "opacity-40" : ""}
          title={disabledActions ? "لا يوجد ID" : "حذف"}
        >
          <Image src="/icons/Trash.png" width={18} height={18} alt="Trash" />
        </button>

        <button
          type="button"
          onClick={() => onEdit?.(row)}
          disabled={disabledActions}
          className={disabledActions ? "opacity-40" : ""}
          title={disabledActions ? "لا يوجد ID" : "تعديل"}
        >
          <Image src="/icons/Edit.png" width={18} height={18} alt="Edit" />
        </button>
      </div>
    );
  };

  return (
    <DataTable
      data={rows}
      columns={columns}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      getRowId={rowId}
      renderActions={renderActions}
      pageSize={6}
    />
  );
}
