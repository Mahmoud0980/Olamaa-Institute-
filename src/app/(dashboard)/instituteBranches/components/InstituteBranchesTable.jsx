"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import InstituteBranchesTableSkeleton from "./InstituteBranchesTableSkeleton";
import Pagination from "@/components/common/Pagination";

export default function InstituteBranchesTable({
  branches = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(branches.length / pageSize) || 1;
  const paginated = branches.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [branches]);

  // ===== Checkbox =====
  const toggleSelect = (branch) => {
    const exists = selectedIds.includes(branch.id);

    const updated = exists
      ? selectedIds.filter((id) => id !== branch.id)
      : [...selectedIds, branch.id];

    onSelectChange?.(updated);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <InstituteBranchesTableSkeleton />
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
                  <th className="p-3">اسم الفرع</th>
                  <th className="p-3">الكود</th>
                  <th className="p-3">المدير</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3 text-center">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((branch, index) => (
                  <tr
                    key={branch.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(branch.id)}
                          onChange={() => toggleSelect(branch)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{branch.name}</td>
                    <td className="p-3">{branch.code || "—"}</td>
                    <td className="p-3">{branch.manager_name || "—"}</td>
                    <td className="p-3">{branch.phone || "—"}</td>

                    <td className="p-3 text-center">
                      {branch.is_active ? (
                        <span className="px-3 py-1 text-xs rounded-xl bg-green-100 text-green-700">
                          نشط
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs rounded-xl bg-red-100 text-red-700">
                          غير نشط
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center rounded-l-xl">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((branch, index) => (
              <div
                key={branch.id}
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
                      checked={selectedIds.includes(branch.id)}
                      onChange={() => toggleSelect(branch)}
                    />
                  </div>
                </div>

                <Info label="اسم الفرع" value={branch.name} />
                <Info label="الكود" value={branch.code} />
                <Info label="المدير" value={branch.manager_name} />
                <Info label="الهاتف" value={branch.phone} />

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الحالة:</span>
                  {branch.is_active ? (
                    <span className="px-3 py-1 text-xs rounded-xl bg-green-100 text-green-700">
                      نشط
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs rounded-xl bg-red-100 text-red-700">
                      غير نشط
                    </span>
                  )}
                </div>

                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onDelete?.(branch)}>
                    <Image
                      src="/icons/Trash.png"
                      alt="trash"
                      width={20}
                      height={20}
                    />
                  </button>
                  <button onClick={() => onEdit?.(branch)}>
                    <Image
                      src="/icons/Edit.png"
                      alt="edit"
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
