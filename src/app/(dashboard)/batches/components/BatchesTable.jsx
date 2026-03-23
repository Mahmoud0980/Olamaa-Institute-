"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

/* ================= Helpers ================= */
const getGenderBadge = (gender) => {
  switch (gender) {
    case "male":
      return {
        text: "ذكور",
        className: "bg-blue-100 text-blue-700",
      };
    case "female":
      return {
        text: "إناث",
        className: "bg-pink-100 text-pink-700",
      };
    case "mixed":
      return {
        text: "مختلطة",
        className: "bg-purple-100 text-purple-700",
      };
    default:
      return {
        text: "غير محدد",
        className: "bg-gray-100 text-gray-600",
      };
  }
};

function StatusBadge({ text, color }) {
  const colors = {
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    gray: "bg-gray-200 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`px-3 py-1 text-xs rounded-xl ${colors[color]}`}>
      {text}
    </span>
  );
}

export default function BatchesTable({
  batches = [],
  pagination = {},
  page = 1,
  onPageChange,
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { header: "اسم الشعبة", key: "name" },
    { 
      header: "الفرع", 
      key: "institute_branch", 
      render: (val) => val?.name || "—" 
    },
    { 
      header: "الفرع الأكاديمي", 
      key: "academic_branch", 
      render: (val) => val?.name || "—" 
    },
    { 
      header: "القاعة", 
      key: "class_room", 
      render: (val) => val?.name || "—" 
    },
    { header: "تاريخ البداية", key: "start_date" },
    { header: "تاريخ النهاية", key: "end_date" },
    { 
      header: "الجنس", 
      key: "gender_type", 
      render: (val) => {
        const gender = getGenderBadge(val);
        return (
          <span className={`px-3 py-1 text-xs rounded-xl ${gender.className}`}>
            {gender.text}
          </span>
        );
      }
    },
    { 
      header: "الحالة", 
      key: "id", 
      render: (_, batch) => {
        if (batch.is_completed) return <StatusBadge text="مكتملة" color="green" />;
        if (batch.is_hidden) return <StatusBadge text="مخفية" color="orange" />;
        if (batch.is_archived) return <StatusBadge text="مؤرشفة" color="gray" />;
        return <StatusBadge text="نشطة" color="blue" />;
      }
    },
  ], []);

  const renderActions = (row) => (
    <div className="flex justify-center gap-6">
      <button onClick={() => onDelete?.(row)}>
        <Image src="/icons/Trash.png" alt="trash" width={20} height={20} />
      </button>

      <button onClick={() => onEdit?.(row.id)}>
        <Image src="/icons/Edit.png" alt="edit" width={20} height={20} />
      </button>
    </div>
  );

  return (
    <DataTable
      data={batches}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      serverSide={true}
      currentPage={page}
      totalPages={pagination.last_page || 1}
      onPageChange={onPageChange}
      pageSize={pagination.per_page || 10}
      emptyMessage="لا توجد شعب حالياً."
    />
  );
}
