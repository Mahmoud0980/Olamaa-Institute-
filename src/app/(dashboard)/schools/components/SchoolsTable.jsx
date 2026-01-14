"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import SchoolsSkeleton from "./SchoolsSkeleton";

const typeLabel = (t) => {
  if (t === "public") return "حكومية";
  if (t === "private") return "خاصة";
  return t ?? "-";
};

export default function SchoolsTable({
  schools = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const safeSchools = Array.isArray(schools) ? schools : [];

  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(safeSchools.length / pageSize) || 1;
  const paginated = safeSchools.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page !== 1) setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools.length]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // ===== Checkbox =====
  const toggleSelect = (row) => {
    if (!onSelectChange) return;

    const exists = selectedIds.includes(row.id);
    const updated = exists
      ? selectedIds.filter((id) => id !== row.id)
      : [...selectedIds, row.id];

    onSelectChange(updated);
  };

  const statusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
        مفعلة
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
        متوقفة
      </span>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <SchoolsSkeleton />
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">اسم المدرسة</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">المدينة</th>
                  <th className="p-3">ملاحظات</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row, index) => (
                  <tr
                    key={row.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleSelect(row)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{row?.name ?? "—"}</td>
                    <td className="p-3">{typeLabel(row?.type)}</td>
                    <td className="p-3">{row?.city ?? "—"}</td>
                    <td className="p-3">{row?.notes ?? "—"}</td>
                    <td className="p-3">{statusBadge(!!row?.is_active)}</td>

                    <td className="p-3 rounded-l-xl text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => onEdit?.(row.id)}>
                          <Image
                            src="/icons/Edit.png"
                            width={18}
                            height={18}
                            alt="edit"
                          />
                        </button>

                        <button onClick={() => onDelete?.(row)}>
                          <Image
                            src="/icons/Trash.png"
                            width={18}
                            height={18}
                            alt="delete"
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
            {paginated.map((row, index) => (
              <div
                key={row.id}
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
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row)}
                    />
                  </div>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الاسم:</span>
                  <span className="font-semibold">{row?.name ?? "—"}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">النوع:</span>
                  <span>{typeLabel(row?.type)}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">المدينة:</span>
                  <span>{row?.city ?? "—"}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الملاحظات:</span>
                  <span className="text-right">{row?.notes ?? "—"}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الحالة:</span>
                  <span>{statusBadge(!!row?.is_active)}</span>
                </div>

                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onEdit?.(row.id)}>
                    <Image
                      src="/icons/Edit.png"
                      width={20}
                      height={20}
                      alt="edit"
                    />
                  </button>

                  <button onClick={() => onDelete?.(row)}>
                    <Image
                      src="/icons/Trash.png"
                      width={20}
                      height={20}
                      alt="delete"
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
