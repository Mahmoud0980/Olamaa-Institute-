"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import BatchesTableSkeleton from "./BatchesTableSkeleton";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";

export default function BatchesTable({
  batches,
  isLoading,
  search,
  onEdit,
  onDelete,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const { data: academicData } = useGetAcademicBranchesQuery();
  const academics = academicData?.data || [];

  const getBranchName = (id) => {
    return branches.find((b) => b.id === id)?.name || "—";
  };

  const getAcademicName = (id) => {
    return academics.find((a) => a.id === id)?.name || "—";
  };

  const filtered = batches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 mt-6 w-full">
      {isLoading ? (
        <BatchesTableSkeleton />
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 rounded-r-xl">#</th>
                  <th className="p-3">اسم الشعبة</th>
                  <th className="p-3">الفرع</th>
                  <th className="p-3">الفرع الأكاديمي</th>
                  <th className="p-3">تاريخ البداية</th>
                  <th className="p-3">تاريخ النهاية</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((batch, index) => (
                  <tr
                    key={batch.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 rounded-r-xl">
                      {(page - 1) * pageSize + index + 1}
                    </td>

                    <td className="p-3 font-medium">{batch.name}</td>

                    <td className="p-3">
                      {getBranchName(batch.institute_branch_id)}
                    </td>

                    <td className="p-3">
                      {getAcademicName(batch.academic_branch_id)}
                    </td>

                    <td className="p-3">{batch.start_date}</td>

                    <td className="p-3">{batch.end_date}</td>

                    <td className="p-3">
                      {batch.is_completed ? (
                        <span className="status bg-green-100 text-green-700">
                          مكتملة
                        </span>
                      ) : batch.is_hidden ? (
                        <span className="status bg-orange-100 text-orange-700">
                          مخفية
                        </span>
                      ) : batch.is_archived ? (
                        <span className="status bg-gray-200 text-gray-700">
                          مؤرشفة
                        </span>
                      ) : (
                        <span className="status bg-blue-100 text-blue-700">
                          نشطة
                        </span>
                      )}
                    </td>

                    <td className="p-3 rounded-l-xl text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => onEdit(batch.id)}>
                          <Image
                            src="/icons/Edit.png"
                            width={18}
                            height={18}
                            alt="edit batch"
                          />
                        </button>
                        <button onClick={() => onDelete(batch.id)}>
                          <Image
                            src="/icons/Trash.png"
                            width={18}
                            height={18}
                            alt="delete batch"
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
            {paginated.map((batch, index) => (
              <div
                key={batch.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">رقم:</span>
                  <span>{(page - 1) * pageSize + index + 1}</span>
                </div>

                <div className="row">
                  <span>اسم الشعبة:</span>
                  <span>{batch.name}</span>
                </div>
                <div className="row">
                  <span>الفرع:</span>
                  <span>{getBranchName(batch.institute_branch_id)}</span>
                </div>
                <div className="row">
                  <span>الفرع الأكاديمي:</span>
                  <span>{getAcademicName(batch.academic_branch_id)}</span>
                </div>
                <div className="row">
                  <span>البداية:</span>
                  <span>{batch.start_date}</span>
                </div>
                <div className="row">
                  <span>النهاية:</span>
                  <span>{batch.end_date}</span>
                </div>
                <div className="flex justify-center gap-6 mt-3">
                  <button onClick={() => onDelete(batch.id)}>
                    <Image
                      src="/icons/Trash.png"
                      width={20}
                      height={20}
                      alt="delete batch"
                    />
                  </button>
                  <button onClick={() => onEdit(batch.id)}>
                    <Image
                      src="/icons/Edit.png"
                      width={20}
                      height={20}
                      alt="edit batch"
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
