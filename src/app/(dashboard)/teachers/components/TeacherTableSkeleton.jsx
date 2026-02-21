"use client";

export default function TeachersTableSkeleton({ rows = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= DESKTOP TABLE SKELETON ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700">
              <th className="p-3 text-center rounded-r-xl">#</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الفرع</th>
              <th className="p-3">الاختصاص</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">تاريخ التعيين</th>
              <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="bg-white hover:bg-pink-50 transition">
                {/* # + checkbox */}
                <td className="p-3 text-center rounded-r-xl">
                  <div className="flex gap-2 justify-center items-center animate-pulse">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-4 w-6 bg-gray-200 rounded" />
                  </div>
                </td>

                {/* name */}
                <td className="p-3">
                  <div className="h-4 w-44 bg-gray-200 rounded animate-pulse" />
                </td>

                {/* branch */}
                <td className="p-3">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </td>

                {/* specialization */}
                <td className="p-3">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </td>

                {/* phone */}
                <td className="p-3">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </td>

                {/* hire date */}
                <td className="p-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </td>

                {/* actions */}
                <td className="p-3 text-center rounded-l-xl">
                  <div className="flex justify-center animate-pulse">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS SKELETON ================= */}
      <div className="md:hidden space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            {/* checkbox + index */}
            <div className="flex justify-between mb-3 animate-pulse">
              <div className="h-4 w-6 bg-gray-200 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-6 bg-gray-200 rounded" />
                <div className="w-4 h-4 bg-gray-200 rounded" />
              </div>
            </div>

            <MobileRowSkeleton wide />
            <MobileRowSkeleton />
            <MobileRowSkeleton />
            <MobileRowSkeleton />
            <MobileRowSkeleton />

            {/* actions */}
            <div className="mt-4 flex justify-center animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= PAGINATION SKELETON ================= */}
      <div className="flex justify-center items-center gap-4 mt-6 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
        <div className="w-28 h-4 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

function MobileRowSkeleton({ wide = false }) {
  return (
    <div className="flex justify-between mb-2 animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded" />
      <div className={`h-4 ${wide ? "w-40" : "w-28"} bg-gray-200 rounded`} />
    </div>
  );
}
