"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

export default function CitiesTable({
  cities = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const truncate = (txt, len = 25) =>
    txt?.length > len ? txt.substring(0, len) + "..." : txt;

  const columns = useMemo(() => [
    { 
      header: "اسم المدينة", 
      key: "name" 
    },
    { 
      header: "الوصف", 
      key: "description", 
      render: (val) => <span title={val}>{truncate(val || "—")}</span> 
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

  const renderActions = (city) => (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onDelete?.(city)}
        className="cursor-pointer"
      >
        <Image
          src={"/icons/Trash.png"}
          alt="trash"
          width={18}
          height={18}
        />
      </button>
      <button
        onClick={() => onEdit?.(city.id)}
        className="cursor-pointer"
      >
        <Image
          src={"/icons/Edit.png"}
          alt="edit"
          width={18}
          height={18}
        />
      </button>
    </div>
  );

  return (
    <DataTable
      data={cities}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={6}
      emptyMessage="لا توجد مدن."
    />
  );
}
