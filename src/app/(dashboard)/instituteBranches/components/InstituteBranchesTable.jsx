"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

export default function InstituteBranchesTable({
  branches = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "اسم الفرع", 
      key: "name" 
    },
    { 
      header: "الكود", 
      key: "code", 
      render: (val) => val || "—" 
    },
    { 
      header: "المدير", 
      key: "manager_name", 
      render: (val) => val || "—" 
    },
    { 
      header: "الهاتف", 
      key: "phone", 
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

  const renderActions = (branch) => (
    <div className="flex justify-center gap-4">
      <button onClick={() => onDelete?.(branch)}>
        <Image
          src="/icons/Trash.png"
          alt="trash"
          width={18}
          height={18}
        />
      </button>
      <button onClick={() => onEdit?.(branch)}>
        <Image
          src="/icons/Edit.png"
          alt="edit"
          width={18}
          height={18}
        />
      </button>
    </div>
  );

  return (
    <DataTable
      data={branches}
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
