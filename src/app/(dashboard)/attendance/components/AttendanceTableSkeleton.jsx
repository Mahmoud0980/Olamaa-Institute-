"use client";

import Skeleton from "@/components/common/Skeleton";

export default function AttendanceTableSkeleton() {
  return (
    <div className="w-full">
      {/* Mobile Skeleton */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-2"
          >
            <Skeleton width="40%" height="18px" />
            <Skeleton width="60%" height="14px" />
            <Skeleton width="50%" height="14px" />
          </div>
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-3 rounded-r-xl text-[13px] text-gray-600">#</th>
              <th className="p-3 text-[13px] text-gray-600">اليوم</th>
              <th className="p-3 text-[13px] text-gray-600">التاريخ</th>
              <th className="p-3 text-[13px] text-gray-600 text-center">
                التفقد
              </th>
              <th className="p-3 text-[13px] text-gray-600">وقت الوصول</th>
              <th className="p-3 text-[13px] text-gray-600">وقت الانصراف</th>
              <th className="p-3 rounded-l-xl text-[13px] text-gray-600 text-center">
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="bg-white">
                <td className="p-3">
                  <Skeleton width="20px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="70px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="90px" height="14px" />
                </td>
                <td className="p-3 text-center">
                  <Skeleton width="70px" height="18px" />
                </td>
                <td className="p-3">
                  <Skeleton width="70px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="70px" height="14px" />
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-4">
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
