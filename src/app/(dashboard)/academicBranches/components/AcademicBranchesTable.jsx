"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AcademicBranchesSkeleton from "./AcademicBranchesSkeleton";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function AcademicBranchesTable({
  branches = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  const safeBranches = Array.isArray(branches) ? branches : [];

  // (اختياري) لجلب اسم الفرع إذا كان موجود institute_branch_id
  const { data: instData } = useGetInstituteBranchesQuery();
  const instituteBranches = instData?.data || [];

  const getInstituteBranchName = (id) =>
    instituteBranches.find((b) => Number(b.id) === Number(id))?.name || "-";

  const hasInstituteBranchId = useMemo(() => {
    return safeBranches.some(
      (b) => b?.institute_branch_id != null || b?.branch_id != null
    );
  }, [safeBranches]);

  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(safeBranches.length / pageSize) || 1;
  const paginated = safeBranches.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [branches.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
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

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <AcademicBranchesSkeleton />
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
                  <th className="p-3">اسم الفرع الأكاديمي</th>
                  {hasInstituteBranchId && <th className="p-3">الفرع</th>}
                  <th className="p-3">الوصف</th>
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

                    {hasInstituteBranchId && (
                      <td className="p-3">
                        {getInstituteBranchName(
                          row?.institute_branch_id ?? row?.branch_id
                        )}
                      </td>
                    )}

                    <td className="p-3">{row?.description ?? "—"}</td>

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

                {hasInstituteBranchId && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">الفرع:</span>
                    <span>
                      {getInstituteBranchName(
                        row?.institute_branch_id ?? row?.branch_id
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الوصف:</span>
                  <span>{row?.description ?? "—"}</span>
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
