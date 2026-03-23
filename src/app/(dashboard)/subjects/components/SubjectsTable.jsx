"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

export default function SubjectsTable({
  subjects = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "اسم المادة", 
      key: "name" 
    },
    { 
      header: "الفرع الأكاديمي", 
      key: "academic_branch", 
      render: (val) => val?.name || "—" 
    },
    { 
      header: "الوصف", 
      key: "description", 
      render: (val) => val || "—" 
    },
  ], []);

  const renderActions = (subject) => (
    <div className="flex justify-center gap-6">
      <button
        onClick={() => onDelete?.(subject)}
        className="cursor-pointer"
      >
        <Image
          src="/icons/Trash.png"
          alt="trash"
          width={20}
          height={20}
        />
      </button>

      <button
        onClick={() => onEdit?.(subject.id)}
        className="cursor-pointer"
      >
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
      data={subjects}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={6}
      emptyMessage="لا توجد مواد"
    />
  );
}
