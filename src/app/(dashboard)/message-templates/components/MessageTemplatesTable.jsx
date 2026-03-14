"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination";

export default function MessageTemplatesTable({
  templates = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(templates.length / pageSize) || 1;
  const paginated = templates.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [templates]);

  // ===== Checkbox =====
  const toggleSelect = (item) => {
    const exists = selectedIds.includes(item.id);
    const updated = exists
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    onSelectChange?.(updated);
  };

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

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <div className="py-10 text-center text-gray-400">جاري التحميل...</div>
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">
          لا توجد نماذج مضافة بعد
        </div>
      ) : (
        <>
          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">اسم النموذج</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">الفئة</th>
                  <th className="p-3">الموضوع</th>
                   <th className="p-3">النموذج</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((template, index) => (
                  <tr
                    key={template.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(template.id)}
                          onChange={() => toggleSelect(template)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{template.name}</td>
                    <td className="p-3">{typeLabel(template.type)}</td>
                    <td className="p-3">{categoryLabel(template.category)}</td>
                    <td className="p-3 max-w-[220px] truncate">
                      {template.subject || "—"}
                    </td>
                      <td className="p-3 max-w-[220px] truncate">
                      {template.body || "—"}
                    </td> 

                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 text-xs rounded-xl ${
                          template.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {template.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </td>

                    <td className="p-3 text-center rounded-l-xl">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((template, index) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">#</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selectedIds.includes(template.id)}
                      onChange={() => toggleSelect(template)}
                    />
                  </div>
                </div>

                <Info label="اسم النموذج" value={template.name} />
                <Info label="النوع" value={typeLabel(template.type)} />
                <Info label="الفئة" value={categoryLabel(template.category)} />
                <Info label="الموضوع" value={template.subject} />
                <Info
                  label="الحالة"
                  value={template.is_active ? "نشط" : "غير نشط"}
                />

                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onEdit?.(template)}>
                    <Image
                      src="/icons/Edit.png"
                      alt="edit"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button onClick={() => onDelete?.(template)}>
                    <Image
                      src="/icons/Trash.png"
                      alt="delete"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}