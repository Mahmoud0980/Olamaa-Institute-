"use client";

import Skeleton from "@/components/common/Skeleton";

export default function InstituteBranchesTableSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton width="20%" height="14px" />
              <Skeleton width="15%" height="14px" />
            </div>

            <div className="flex justify-between">
              <Skeleton width="30%" height="14px" />
              <Skeleton width="50%" height="14px" />
            </div>

            <div className="flex justify-center gap-6 mt-3">
              <Skeleton width="20px" height="20px" />
              <Skeleton width="20px" height="20px" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-3 rounded-r-xl">
                <Skeleton width="20px" height="14px" />
              </th>
              <th className="p-3">
                <Skeleton width="120px" height="14px" />
              </th>
              <th className="p-3 rounded-l-xl">
                <Skeleton width="80px" height="14px" />
              </th>
            </tr>
          </thead>

          <tbody>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <tr key={i} className="bg-white">
                <td className="p-3 rounded-r-xl">
                  <Skeleton width="40px" height="14px" />
                </td>

                <td className="p-3">
                  <Skeleton width="60%" height="14px" />
                </td>

                <td className="p-3 rounded-l-xl">
                  <div className="flex justify-center gap-4">
                    <Skeleton width="18px" height="18px" />
                    <Skeleton width="18px" height="18px" />
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
