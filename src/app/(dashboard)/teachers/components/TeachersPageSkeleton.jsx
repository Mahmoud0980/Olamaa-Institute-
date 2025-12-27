"use client";

export default function TeachersPageSkeleton() {
  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6 animate-pulse">
      {/* ===== Actions Skeleton ===== */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-32 rounded-xl bg-gray-200" />
        <div className="flex gap-2">
          <div className="h-10 w-24 rounded-xl bg-gray-200" />
          <div className="h-10 w-24 rounded-xl bg-gray-200" />
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="w-full flex flex-col gap-6">
        {/* ===== Teachers Table Skeleton ===== */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-4">
          {/* table header */}
          <div className="grid grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 rounded bg-gray-200" />
            ))}
          </div>

          {/* rows */}
          {[...Array(5)].map((_, row) => (
            <div key={row} className="grid grid-cols-6 gap-4 items-center">
              {[...Array(6)].map((_, col) => (
                <div key={col} className="h-4 rounded bg-gray-100" />
              ))}
            </div>
          ))}
        </div>

        {/* ===== Courses Table Skeleton ===== */}
        <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-4">
          <div className="h-5 w-40 rounded bg-gray-200" />

          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center gap-4">
              <div className="h-4 w-1/3 rounded bg-gray-100" />
              <div className="h-4 w-1/4 rounded bg-gray-100" />
              <div className="h-4 w-1/6 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
