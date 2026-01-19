"use client";

import Skeleton from "@/components/common/Skeleton";

export default function PaymentsTableSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 mt-6 w-full">
      {/* MOBILE */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="border rounded-xl p-4 space-y-2">
            <Skeleton width="40%" height="16px" />
            <Skeleton width="60%" height="14px" />
            <Skeleton width="50%" height="14px" />
            <Skeleton width="70%" height="14px" />
            <div className="flex justify-center gap-4 pt-2">
              <Skeleton width="20px" height="20px" />
              <Skeleton width="20px" height="20px" />
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="bg-white">
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="p-3">
                    <Skeleton width="80px" height="14px" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
