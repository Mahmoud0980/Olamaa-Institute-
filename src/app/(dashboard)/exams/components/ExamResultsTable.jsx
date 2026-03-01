// ./components/ExamResultsTable.jsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Pagination from "@/components/common/Pagination";

const getResultId = (r) =>
  String(r?.id ?? r?.exam_result_id ?? r?.result_id ?? "");

function PassChip({ passed }) {
  if (passed === true)
    return <span className="text-green-700 font-medium">ناجح</span>;
  if (passed === false)
    return <span className="text-red-700 font-medium">راسب</span>;
  return <span className="text-gray-400">—</span>;
}

function PendingChip({ pending }) {
  if (!pending) return null;
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
      قيد الموافقة
    </span>
  );
}

export default function ExamResultsTable({
  rows = [],
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
  pendingMap = {}, // ✅ جديد
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const totalPages = Math.ceil(safeRows.length / pageSize) || 1;
  const paginated = safeRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [safeRows.length]);

  const toggleSelect = (row) => {
    if (!onSelectChange) return;
    const id = getResultId(row);
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onSelectChange(updated);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {!paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا يوجد علامات.</div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">المادة</th>
                  <th className="p-3">المذاكرة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">العلامة</th>
                  <th className="p-3">النتيجة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row, index) => {
                  const id = getResultId(row);
                  const pending = !!pendingMap?.[id];

                  const studentName =
                    `${row?.student_first_name ?? ""} ${row?.student_last_name ?? ""}`.trim() ||
                    row?.student_name ||
                    "—";

                  return (
                    <tr
                      key={id || index}
                      className="bg-white hover:bg-pink-50 transition"
                    >
                      <td className="p-3 text-center rounded-r-xl">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#6F013F]"
                            checked={selectedIds.includes(id)}
                            onChange={() => toggleSelect(row)}
                          />
                          <span>{(page - 1) * pageSize + index + 1}</span>
                        </div>
                      </td>

                      <td className="p-3 font-medium">{studentName}</td>
                      <td className="p-3">{row?.subject_name ?? "—"}</td>
                      <td className="p-3">
                        {row?.exam_name ?? row?.name ?? "—"}
                      </td>
                      <td className="p-3">{row?.exam_date ?? "—"}</td>
                      <td className="p-3">
                        {row?.obtained_marks ?? row?.marks ?? "—"}
                      </td>
                      <td className="p-3">
                        <PassChip passed={row?.is_passed} />
                      </td>

                      <td className="p-3 rounded-l-xl text-center">
                        <div className="flex items-center justify-center gap-3">
                          <PendingChip pending={pending} />

                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => onDelete?.(row)}
                            className={pending ? "opacity-50" : ""}
                            title="حذف"
                          >
                            <Image
                              src="/icons/Trash.png"
                              width={18}
                              height={18}
                              alt="Trash"
                            />
                          </button>

                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => onEdit?.(row)}
                            className={pending ? "opacity-50" : ""}
                            title="تعديل"
                          >
                            <Image
                              src="/icons/Edit.png"
                              width={18}
                              height={18}
                              alt="Edit"
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

          {/* Mobile */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((row, index) => {
              const id = getResultId(row);
              const pending = !!pendingMap?.[id];
              const studentName =
                `${row?.student_first_name ?? ""} ${row?.student_last_name ?? ""}`.trim() ||
                row?.student_name ||
                "—";

              return (
                <div
                  key={id || index}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">#</span>
                      <span className="font-semibold">
                        {(page - 1) * pageSize + index + 1}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#6F013F]"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelect(row)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <PendingChip pending={pending} />
                      <PassChip passed={row?.is_passed} />
                    </div>
                  </div>

                  <Info label="الطالب" value={studentName} />
                  <Info label="المادة" value={row?.subject_name} />
                  <Info label="المذاكرة" value={row?.exam_name ?? row?.name} />
                  <Info label="التاريخ" value={row?.exam_date} />
                  <Info
                    label="العلامة"
                    value={row?.obtained_marks ?? row?.marks}
                  />

                  <div className="flex justify-end gap-4 mt-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onDelete?.(row)}
                      className={pending ? "opacity-50" : ""}
                    >
                      <Image
                        src="/icons/Trash.png"
                        width={18}
                        height={18}
                        alt="Trash"
                      />
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => onEdit?.(row)}
                      className={pending ? "opacity-50" : ""}
                    >
                      <Image
                        src="/icons/Edit.png"
                        width={18}
                        height={18}
                        alt="Edit"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

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
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
