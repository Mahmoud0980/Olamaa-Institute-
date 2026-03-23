"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

export default function ClassRoomsTable({
  data = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "اسم القاعة", 
      key: "name" 
    },
    { 
      header: "الكود", 
      key: "code", 
      render: (val) => val || "—" 
    },
    { 
      header: "السعة", 
      key: "capacity", 
      className: "text-center" 
    },
    { 
      header: "ملاحظات", 
      key: "notes", 
      render: (val) => val || "—" 
    },
  ], []);

  const renderActions = (room) => (
    <div className="flex justify-center gap-4">
      <button onClick={() => onEdit?.(room)}>
        <Image
          src="/icons/Edit.png"
          alt="edit"
          width={18}
          height={18}
        />
      </button>
      <button onClick={() => onDelete?.(room)}>
        <Image
          src="/icons/Trash.png"
          alt="delete"
          width={18}
          height={18}
        />
      </button>
    </div>
  );

  return (
    <DataTable
      data={data}
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
