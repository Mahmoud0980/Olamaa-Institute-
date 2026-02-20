"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Pagination from "@/components/common/Pagination";

// API

import SubjectsTableSkeleton from "./SubjectsTableSkeleton";

// ================= Skeleton =================
function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}

// ================= Table =================
export default function SubjectsTable({
  subjects = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
}) {
  // ===== Academic Branches =====
  // const { data: academicData } = useGetAcademicBranchesQuery();
  // const academicBranches = academicData?.data || [];

  // const getAcademicName = (id) =>
  //   academicBranches.find((a) => a.id === id)?.name || "-";

  const getAcademicName = (subject) => subject.academic_branch?.name || "-";

  // ===== Pagination =====
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const totalPages = Math.ceil(subjects.length / pageSize) || 1;
  const paginated = subjects.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [subjects]);

  // ===== Checkbox =====
  const toggleSelect = (subject) => {
    const exists = selectedIds.includes(subject.id);

    const updated = exists
      ? selectedIds.filter((id) => id !== subject.id)
      : [...selectedIds, subject.id];

    onSelectChange(updated);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <SubjectsTableSkeleton />
      ) : (
        <>
          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center">#</th>
                  <th className="p-3">اسم المادة</th>
                  <th className="p-3">الفرع الأكاديمي</th>
                  <th className="p-3">الوصف</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    {/* Checkbox + Index */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(subject.id)}
                          onChange={() => toggleSelect(subject)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="p-3 font-medium">{subject.name}</td>

                    {/* Academic Branch */}
                    <td className="p-3">{getAcademicName(subject)}</td>

                    {/* Description */}
                    <td className="p-3">{subject.description || "-"}</td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex justify-center gap-6 mt-3">
                        <button
                          onClick={() => onDelete(subject)}
                          className="cursor-pointer"
                        >
                          <Image
                            src="/icons/Trash.png"
                            alt="trash"
                            width={20}
                            height={20}
                          />
                        </button>

                        <button
                          onClick={() => onEdit(subject.id)}
                          className="cursor-pointer"
                        >
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
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-500">
                      لا توجد مواد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((subject, index) => (
              <div
                key={subject.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                {/* checkbox + index */}
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">#</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selectedIds.includes(subject.id)}
                      onChange={() => toggleSelect(subject)}
                    />
                  </div>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">اسم المادة:</span>
                  <span className="font-semibold">{subject.name}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الفرع الأكاديمي:</span>
                  <span>{getAcademicName(subject)}</span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">الوصف:</span>
                  <span className="text-right">
                    {subject.description || "-"}
                  </span>
                </div>

                <div className="flex justify-center gap-2 mt-1">
                  <button
                    onClick={() => onEdit(subject.id)}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/icons/Edit.png"
                      alt="edit"
                      width={20}
                      height={20}
                    />
                  </button>

                  <button
                    onClick={() => onDelete(subject)}
                    className="cursor-pointer"
                  >
                    <Image
                      src="/icons/Trash.png"
                      alt="trash"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            ))}

            {paginated.length === 0 && (
              <div className="text-center text-gray-500 py-6">لا توجد مواد</div>
            )}
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
