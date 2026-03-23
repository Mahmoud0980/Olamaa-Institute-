"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

const getResultId = (r) =>
  String(r?.id ?? r?.exam_result_id ?? r?.result_id ?? "");

function PassChip({ passed }) {
  if (!passed) return <span className="text-gray-400">—</span>;

  if (passed === true || passed === 1 || passed === "1" || passed === "ناجح")
    return <span className="text-green-700 font-medium">ناجح</span>;

  if (passed === false || passed === 0 || passed === "0" || passed === "راسب")
    return <span className="text-red-700 font-medium">راسب</span>;

  return <span className="text-gray-400">{passed}</span>;
}

function PendingChip({ pending }) {
  if (!pending) return null;
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
      قيد الموافقة
    </span>
  );
}

export default function ExamResultsTable({
  rows = [],
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
  pendingMap = {},
}) {
  const columns = useMemo(
    () => [
      {
        header: "الطالب",
        key: "student_name",
        render: (val, row) =>
          val ||
          `${row?.student_first_name ?? ""} ${
            row?.student_last_name ?? ""
          }`.trim() ||
          "—",
      },
      {
        header: "المادة",
        key: "subject_name",
        render: (val) => val ?? "—",
      },
      {
        header: "نوع الإمتحان",
        key: "exam_name",
        render: (val) => val ?? "—",
      },
      {
        header: "التاريخ",
        key: "exam_date",
        render: (val) => val ?? "—",
      },
      {
        header: "العلامة",
        key: "obtained_marks",
        render: (val, row) => val ?? row?.is_passed ?? "—",
      },
      {
        header: "النتيجة",
        key: "is_passed",
        render: (val) => <PassChip passed={val} />,
      },
    ],
    [],
  );

  const renderActions = (row) => {
    const id = getResultId(row);
    const pending = !!pendingMap?.[id];

    return (
      <div className="flex items-center justify-center gap-3">
        <PendingChip pending={pending} />

        <button
          type="button"
          disabled={pending}
          onClick={() => onDelete?.(row)}
          className={pending ? "opacity-50" : ""}
          title="حذف"
        >
          <Image src="/icons/Trash.png" width={18} height={18} alt="Trash" />
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => onEdit?.(row)}
          className={pending ? "opacity-50" : ""}
          title="تعديل"
        >
          <Image src="/icons/Edit.png" width={18} height={18} alt="Edit" />
        </button>
      </div>
    );
  };

  return (
    <div className="rounded-xl w-full">
      <DataTable
        data={rows}
        columns={columns}
        selectedIds={selectedIds}
        onSelectChange={onSelectChange}
        getRowId={getResultId}
        pageSize={6}
        renderActions={renderActions}
        emptyMessage="لا يوجد علامات."
      />
    </div>
  );
}
