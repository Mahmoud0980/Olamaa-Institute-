"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination";
import Image from "next/image";

const getExamId = (r) => r?.id ?? r?.exam_id ?? r?.examId ?? null;

const rowId = (r) =>
  String(
    getExamId(r) ??
      `${r?.name ?? "exam"}-${r?.exam_date ?? "d"}-${r?.exam_time ?? "t"}-${r?.exam_type ?? "type"}`,
  );

const timeLabel = (t) => (t ? String(t).slice(0, 5) : "—");

function StatusChip({ value }) {
  const s = String(value ?? "").toLowerCase();

  const base = "px-2 py-0.5 text-xs rounded-full";
  if (s === "completed")
    return <span className={`${base} bg-green-100 text-green-700`}>مكتمل</span>;
  if (s === "scheduled")
    return <span className={`${base} bg-blue-100 text-blue-700`}>مجدول</span>;
  if (s === "cancelled" || s === "canceled")
    return <span className={`${base} bg-red-100 text-red-700`}>ملغى</span>;

  return (
    <span className={`${base} bg-gray-100 text-gray-700`}>{value ?? "—"}</span>
  );
}

export default function ExamsTable({
  rows = [],
  selectedIds = [],
  onSelectChange,

  // ✅ جديد
  onEdit,
  onDelete,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(safeRows.length / pageSize) || 1;
  const paginated = safeRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [safeRows.length]);

  const toggleSelect = (row) => {
    if (!onSelectChange) return;
    const id = rowId(row);
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onSelectChange(updated);
  };

  const handleEdit = (row) => {
    const id = getExamId(row);
    if (!id) return;
    onEdit?.(row);
  };

  const handleDelete = (row) => {
    const id = getExamId(row);
    if (!id) return;
    onDelete?.(row);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {!paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا يوجد مذاكرات.</div>
      ) : (
        <>
          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">اسم المذاكرة</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">نوع الامتحان</th>
                  <th className="p-3">الوقت</th>
                  <th className="p-3">العلامة العظمى</th>
                  <th className="p-3">علامة النجاح</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 rounded-l-xl text-center">إجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row, index) => {
                  const id = rowId(row);
                  const examId = getExamId(row);
                  const disabledActions = !examId;

                  return (
                    <tr
                      key={id}
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

                      <td className="p-3 font-medium">{row?.name ?? "—"}</td>
                      <td className="p-3">{row?.exam_date ?? "—"}</td>
                      <td className="p-3">{row?.exam_type ?? "—"}</td>
                      <td className="p-3">{timeLabel(row?.exam_time)}</td>
                      <td className="p-3">{row?.total_marks ?? "—"}</td>
                      <td className="p-3">{row?.passing_marks ?? "—"}</td>
                      <td className="p-3">
                        <StatusChip value={row?.status} />
                      </td>

                      <td className="p-3 rounded-l-xl text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            disabled={disabledActions}
                            className={disabledActions ? "opacity-40" : ""}
                            title={disabledActions ? "لا يوجد ID" : "حذف"}
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
                            onClick={() => handleEdit(row)}
                            disabled={disabledActions}
                            className={disabledActions ? "opacity-40" : ""}
                            title={disabledActions ? "لا يوجد ID" : "تعديل"}
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

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((row, index) => {
              const id = rowId(row);
              const examId = getExamId(row);
              const disabledActions = !examId;

              return (
                <div
                  key={id}
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

                    <div className="flex items-center gap-3">
                      <StatusChip value={row?.status} />

                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        disabled={disabledActions}
                        className={disabledActions ? "opacity-40" : ""}
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
                        onClick={() => handleEdit(row)}
                        disabled={disabledActions}
                        className={disabledActions ? "opacity-40" : ""}
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

                  <Info label="اسم المذاكرة" value={row?.name} />
                  <Info label="التاريخ" value={row?.exam_date} />
                  <Info label="الوقت" value={timeLabel(row?.exam_time)} />
                  <Info label="نوع الامتحان" value={row?.exam_type} />
                  <Info label="العلامة العظمى" value={row?.total_marks} />
                  <Info label="علامة النجاح" value={row?.passing_marks} />
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
