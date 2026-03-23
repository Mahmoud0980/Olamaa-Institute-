"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

export default function BusesTable({
  buses = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "اسم الباص", 
      key: "name" 
    },
    { 
      header: "السعة", 
      key: "capacity" 
    },
    { 
      header: "اسم السائق", 
      key: "driver_name", 
      render: (val) => val || "—" 
    },
    { 
      header: "وصف الطريق", 
      key: "route_description", 
      render: (val) => val || "—" 
    },
    { 
      header: "الحالة", 
      key: "is_active", 
      render: (val) => (
        <span
          className={`px-3 py-1 text-xs rounded-xl ${
            val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {val ? "نشط" : "غير نشط"}
        </span>
      ),
    },
  ], []);

  const renderActions = (bus) => (
    <div className="flex items-center justify-center gap-4">
      <button onClick={() => onDelete?.(bus)}>
        <Image
          src="/icons/Trash.png"
          width={18}
          height={18}
          alt="Trash"
        />
      </button>
      <button onClick={() => onEdit?.(bus.id)}>
        <Image
          src="/icons/Edit.png"
          width={18}
          height={18}
          alt="Edit"
        />
      </button>
    </div>
  );

  return (
    <DataTable
      data={buses}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={6}
      emptyMessage="لا توجد بيانات."
    />
  );
}
