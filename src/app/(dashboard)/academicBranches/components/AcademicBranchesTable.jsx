"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import AcademicBranchesSkeleton from "./AcademicBranchesSkeleton";

export default function AcademicBranchesTable({
  branches,
  isLoading,
  search,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const safeBranches = Array.isArray(branches) ? branches : [];

  const filtered = safeBranches.filter((b) =>
    (b?.name ?? "").toLowerCase().includes((search ?? "").toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  /* ----------------------------------------
     🔥 FIX: رجوع تلقائي للصفحة 1 بعد الحذف
  ---------------------------------------- */
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [totalPages]);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 mt-6 w-full">
      {isLoading ? (
        <AcademicBranchesSkeleton />
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 rounded-r-xl">#</th>
                  <th className="p-3">اسم الفرع</th>
                  <th className="p-3">الوصف</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((branch, index) => (
                  <tr
                    key={branch.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 rounded-r-xl">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    <td className="p-3 font-medium">{branch?.name ?? "—"}</td>

                    <td className="p-3">{branch?.description ?? "—"}</td>

                    <td className="p-3 rounded-l-xl text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => onEdit(branch.id)}>
                          <Image
                            src="/icons/Edit.png"
                            width={18}
                            height={18}
                            alt="edit"
                          />
                        </button>

                        <button onClick={() => onDelete(branch.id)}>
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

          {/* MOBILE */}
          <div className="md:hidden space-y-4">
            {paginated.map((branch) => (
              <div
                key={branch.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="row">
                  <span>الاسم:</span>
                  <span>{branch?.name ?? "—"}</span>
                </div>

                <div className="row">
                  <span>الوصف:</span>
                  <span>{branch?.description ?? "—"}</span>
                </div>

                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onDelete(branch.id)}>
                    <Image
                      src="/icons/Trash.png"
                      width={20}
                      height={20}
                      alt="delete"
                    />
                  </button>

                  <button onClick={() => onEdit(branch.id)}>
                    <Image
                      src="/icons/Edit.png"
                      width={20}
                      height={20}
                      alt="edit"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-4">
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
