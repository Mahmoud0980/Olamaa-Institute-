"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

const AR_DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function dayNameFromYMD(ymd) {
  if (!ymd) return "-";
  const d = new Date(`${ymd}T00:00:00`);
  return AR_DAYS[d.getDay()] || "-";
}

function formatTime(val) {
  if (!val) return "-";
  const t = String(val).split(" ")[1] || "";
  if (!t) return "-";
  const [hh, mm] = t.split(":");
  return hh && mm ? `${hh}:${mm}` : t;
}

const statusBadge = (status) => {
  switch (status) {
    case "present":
      return { text: "موجود", className: "bg-green-100 text-green-700" };
    case "late":
      return { text: "متأخر", className: "bg-orange-100 text-orange-700" };
    case "absent":
      return { text: "غائب", className: "bg-red-100 text-red-700" };
    case "excused":
      return { text: "إذن", className: "bg-blue-100 text-blue-700" };
    default:
      return { text: status || "-", className: "bg-gray-100 text-gray-600" };
  }
};

export default function AttendanceTable({
  records = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
  onRowClick,

  // ✅ Maps
  studentsById = {},
  batchesById = {},
  branchesById = {},
}) {
  const columns = useMemo(() => [
    { 
      header: "الطالب", 
      key: "student_id", 
      render: (val) => (
        <span className="font-medium">
          {studentsById?.[val]?.full_name || "-"}
        </span>
      ) 
    },
    { 
      header: "الفرع", 
      key: "institute_branch_id", 
      render: (val, row) => {
        const batch = batchesById?.[row.batch_id];
        const branch = branchesById?.[val] || batch?.institute_branch;
        return branch?.name || "-";
      }
    },
    { 
      header: "الشعبة", 
      key: "batch_id", 
      className: "max-w-[220px] whitespace-normal break-words leading-5",
      render: (val) => batchesById?.[val]?.name || "-" 
    },
    { 
      header: "اليوم", 
      key: "attendance_date", 
      render: (val) => dayNameFromYMD(val) 
    },
    { 
      header: "التاريخ", 
      key: "attendance_date" 
    },
    { 
      header: "التفقد", 
      key: "status", 
      className: "text-center",
      render: (val) => {
        const badge = statusBadge(val);
        return (
          <span className={`px-3 py-1 text-xs rounded-xl ${badge.className}`}>
            {badge.text}
          </span>
        );
      }
    },
    { 
      header: "وقت الوصول", 
      key: "recorded_at", 
      render: (val) => formatTime(val) 
    },
    { 
      header: "وقت الانصراف", 
      key: "exit_at", 
      render: (_, row) => formatTime(row.exit_at || row.exit_time || row.departure_time) 
    },
  ], [studentsById, batchesById, branchesById]);

  const renderActions = (rec) => (
    <div className="flex justify-center gap-6 mt-1">
      <button onClick={() => onDelete?.(rec)}>
        <Image
          src="/icons/Trash.png"
          alt="trash"
          width={20}
          height={20}
        />
      </button>
      <button onClick={() => onEdit?.(rec)}>
        <Image
          src="/icons/Edit.png"
          alt="edit"
          width={20}
          height={20}
        />
      </button>
    </div>
  );

  return (
    <DataTable
      data={records}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      onRowClick={onRowClick}
      renderActions={renderActions}
      pageSize={6}
      emptyMessage="لا توجد بيانات."
    />
  );
}
