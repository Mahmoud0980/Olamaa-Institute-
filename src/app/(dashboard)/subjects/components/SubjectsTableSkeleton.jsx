"use client";

import Skeleton from "@/components/common/Skeleton";

export default function SubjectsTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton width="30%" height="14px" />
              <Skeleton width="18px" height="18px" />
            </div>

            <Skeleton width="70%" height="14px" />
            <Skeleton width="50%" height="14px" />
            <Skeleton width="60%" height="14px" />

            <div className="flex justify-center gap-6 pt-2">
              <Skeleton width="20px" height="20px" />
              <Skeleton width="20px" height="20px" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-3 rounded-r-xl">
                <Skeleton width="20px" height="12px" />
              </th>
              <th className="p-3">
                <Skeleton width="80px" height="12px" />
              </th>
              <th className="p-3">
                <Skeleton width="90px" height="12px" />
              </th>
              <th className="p-3">
                <Skeleton width="70px" height="12px" />
              </th>
              <th className="p-3 rounded-l-xl text-center">
                <Skeleton width="60px" height="12px" />
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="bg-white">
                {/* checkbox + index */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton width="14px" height="14px" />
                    <Skeleton width="16px" height="12px" />
                  </div>
                </td>

                <td className="p-3">
                  <Skeleton width="120px" height="14px" />
                </td>

                <td className="p-3">
                  <Skeleton width="90px" height="14px" />
                </td>

                <td className="p-3">
                  <Skeleton width="70px" height="14px" />
                </td>

                <td className="p-3 text-center">
                  <div className="flex justify-center gap-4">
                    <Skeleton width="20px" height="20px" />
                    <Skeleton width="20px" height="20px" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
