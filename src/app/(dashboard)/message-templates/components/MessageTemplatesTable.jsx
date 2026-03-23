"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

const typeLabel = (type) => {
  if (type === "sms") return "SMS";
  if (type === "whatsapp") return "WhatsApp";
  if (type === "email") return "Email";
  return type || "—";
};

const categoryLabel = (category) => {
  if (category === "general") return "عام";
  if (category === "payments") return "دفعات";
  if (category === "attendance") return "حضور وغياب";
  if (category === "exams") return "امتحانات";
  return category || "—";
};

export default function MessageTemplatesTable({
  templates = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const columns = useMemo(() => [
    { 
      header: "اسم النموذج", 
      key: "name" 
    },
    { 
      header: "النوع", 
      key: "type", 
      render: typeLabel 
    },
    { 
      header: "الفئة", 
      key: "category", 
      render: categoryLabel 
    },
    { 
      header: "الموضوع", 
      key: "subject", 
      className: "max-w-[220px] truncate", 
      render: (val) => val || "—" 
    },
    { 
      header: "النموذج", 
      key: "body", 
      className: "max-w-[220px] truncate", 
      render: (val) => val || "—" 
    },
    { 
      header: "الحالة", 
      key: "is_active", 
      className: "text-center",
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

  const renderActions = (template) => (
    <div className="flex justify-center gap-4">
      <button onClick={() => onDelete?.(template)}>
        <Image
          src="/icons/Trash.png"
          alt="delete"
          width={18}
          height={18}
        />
      </button>
      <button onClick={() => onEdit?.(template)}>
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
      data={templates}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={6}
      emptyMessage="لا توجد نماذج مضافة بعد"
    />
  );
}