"use client";

import Skeleton from "@/components/common/Skeleton";

export default function SchoolsSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {/* MOBILE */}
      <div className="md:hidden space-y-4">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="border rounded-xl p-4">
            <Skeleton width="50%" height="16px" />
            <Skeleton width="70%" height="14px" className="mt-2" />
            <Skeleton width="40%" height="14px" className="mt-2" />
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-3 text-[13px] text-gray-700">#</th>
              <th className="p-3 text-[13px] text-gray-700">الاسم</th>
              <th className="p-3 text-[13px] text-gray-700">النوع</th>
              <th className="p-3 text-[13px] text-gray-700">المدينة</th>
              <th className="p-3 text-[13px] text-gray-700">الملاحظات</th>
              <th className="p-3 text-[13px] text-gray-700">الحالة</th>
              <th className="p-3 text-[13px] text-gray-700 text-center">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>
                <td className="p-3">
                  <Skeleton width="20px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="140px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="80px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="110px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="200px" height="14px" />
                </td>
                <td className="p-3">
                  <Skeleton width="70px" height="14px" />
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-3">
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
