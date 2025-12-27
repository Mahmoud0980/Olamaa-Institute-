"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import BatchesTableSkeleton from "./BatchesTableSkeleton";

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

export default function BatchesTable({
  batches = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(batches.length / pageSize) || 1;
  const paginated = batches.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [batches]);

  // ===== Checkbox =====
  const toggleSelect = (batch) => {
    const exists = selectedIds.includes(batch.id);
    const updated = exists
      ? selectedIds.filter((id) => id !== batch.id)
      : [...selectedIds, batch.id];

    onSelectChange(updated);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <BatchesTableSkeleton />
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center">#</th>
                  <th className="p-3">اسم الشعبة</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">الفرع الأكاديمي</th>
                  <th className="p-3">القاعة</th>
                  <th className="p-3">تاريخ البداية</th>
                  <th className="p-3">تاريخ النهاية</th>
                  <th className="p-3 text-center">الجنس</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((batch, index) => {
                  const gender = getGenderBadge(batch.gender_type);

                  return (
                    <tr
                      key={batch.id}
                      className="bg-white hover:bg-pink-50 transition"
                    >
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#6F013F]"
                            checked={selectedIds.includes(batch.id)}
                            onChange={() => toggleSelect(batch)}
                          />
                          <span>{(page - 1) * pageSize + index + 1}</span>
                        </div>
                      </td>

                      <td className="p-3 font-medium">{batch.name}</td>
                      <td className="p-3">
                        {batch.institute_branch?.name || "-"}
                      </td>
                      <td className="p-3">
                        {batch.academic_branch?.name || "-"}
                      </td>
                      <td className="p-3">{batch.class_room?.name || "-"}</td>
                      <td className="p-3">{batch.start_date}</td>
                      <td className="p-3">{batch.end_date}</td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 text-xs rounded-xl ${gender.className}`}
                        >
                          {gender.text}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {batch.is_completed ? (
                          <StatusBadge text="مكتملة" color="green" />
                        ) : batch.is_hidden ? (
                          <StatusBadge text="مخفية" color="orange" />
                        ) : batch.is_archived ? (
                          <StatusBadge text="مؤرشفة" color="gray" />
                        ) : (
                          <StatusBadge text="نشطة" color="blue" />
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-6 mt-3">
                          <button onClick={() => onDelete(batch)}>
                            <Image
                              src="/icons/Trash.png"
                              alt="trash"
                              width={20}
                              height={20}
                            />
                          </button>

                          <button onClick={() => onEdit(batch.id)}>
                            <Image
                              src="/icons/Edit.png"
                              alt="edit"
                              width={20}
                              height={20}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((batch, index) => {
              const gender = getGenderBadge(batch.gender_type);

              return (
                <div
                  key={batch.id}
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
                        checked={selectedIds.includes(batch.id)}
                        onChange={() => toggleSelect(batch)}
                      />
                    </div>
                  </div>

                  <InfoRow label="اسم الشعبة" value={batch.name} />
                  <InfoRow label="الفرع" value={batch.institute_branch?.name} />
                  <InfoRow
                    label="الفرع الأكاديمي"
                    value={batch.academic_branch?.name}
                  />
                  <InfoRow label="القاعة" value={batch.class_room?.name} />
                  <InfoRow label="البداية" value={batch.start_date} />
                  <InfoRow label="النهاية" value={batch.end_date} />

                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">الجنس:</span>
                    <span
                      className={`px-3 py-1 text-xs rounded-xl ${gender.className}`}
                    >
                      {gender.text}
                    </span>
                  </div>

                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">الحالة:</span>
                    {batch.is_completed ? (
                      <StatusBadge text="مكتملة" color="green" />
                    ) : batch.is_hidden ? (
                      <StatusBadge text="مخفية" color="orange" />
                    ) : batch.is_archived ? (
                      <StatusBadge text="مؤرشفة" color="gray" />
                    ) : (
                      <StatusBadge text="نشطة" color="blue" />
                    )}
                  </div>

                  <div className="flex justify-center gap-6 mt-3">
                    <button onClick={() => onEdit(batch.id)}>
                      <Image
                        src="/icons/Edit.png"
                        alt="edit"
                        width={20}
                        height={20}
                      />
                    </button>

                    <button onClick={() => onDelete(batch)}>
                      <Image
                        src="/icons/Trash.png"
                        alt="trash"
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= PAGINATION ================= */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border rounded-md bg-white disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-gray-600 text-sm">
              صفحة {page} من {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border rounded-md bg-white disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= Small Components ================= */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span>{value || "-"}</span>
    </div>
  );
}

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
