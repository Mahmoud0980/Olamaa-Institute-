"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

export default function KnowWaysTable({
  data = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "طريقة المعرفة", 
      key: "name" 
    },
  ], []);

  const renderActions = (item) => (
    <div className="flex justify-center gap-4">
      <button onClick={() => onEdit?.(item)}>
        <Image
          src="/icons/Edit.png"
          alt="edit"
          width={18}
          height={18}
        />
      </button>
      <button onClick={() => onDelete?.(item)}>
        <Image
          src="/icons/Trash.png"
          alt="trash"
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
