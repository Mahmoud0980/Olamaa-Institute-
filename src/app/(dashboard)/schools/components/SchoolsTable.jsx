"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

const typeLabel = (t) => {
  if (t === "public") return "حكومية";
  if (t === "private") return "خاصة";
  return t ?? "-";
};

const statusBadge = (isActive) => {
  return isActive ? (
    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
      مفعلة
    </span>
  ) : (
    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
      متوقفة
    </span>
  );
};

export default function SchoolsTable({
  schools = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "اسم المدرسة", 
      key: "name" 
    },
    { 
      header: "النوع", 
      key: "type", 
      render: typeLabel 
    },
    { 
      header: "المدينة", 
      key: "city" 
    },
    { 
      header: "ملاحظات", 
      key: "notes" 
    },
    { 
      header: "الحالة", 
      key: "is_active", 
      render: (val) => statusBadge(!!val) 
    },
  ], []);

  const renderActions = (row) => (
    <div className="flex items-center justify-center gap-4">
      <button onClick={() => onEdit?.(row.id)}>
        <Image
          src="/icons/Edit.png"
          width={18}
          height={18}
          alt="edit"
        />
      </button>

      <button onClick={() => onDelete?.(row)}>
        <Image
          src="/icons/Trash.png"
          width={18}
          height={18}
          alt="delete"
        />
      </button>
    </div>
  );

  return (
    <DataTable
      data={schools}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={4}
      emptyMessage="لا توجد بيانات."
    />
  );
}
