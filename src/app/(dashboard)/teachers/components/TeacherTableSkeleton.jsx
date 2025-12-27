"use client";

export default function TeachersTableSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {/* Header */}
      <div className="h-10 bg-pink-50 rounded-lg mb-4 animate-pulse" />

      {/* Rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border border-gray-100 rounded-lg p-3 animate-pulse"
          >
            {/* checkbox */}
            <div className="w-4 h-4 bg-gray-200 rounded" />

            {/* name */}
            <div className="h-4 w-40 bg-gray-200 rounded" />

            {/* branch */}
            <div className="h-4 w-28 bg-gray-200 rounded" />

            {/* specialization */}
            <div className="h-4 w-28 bg-gray-200 rounded" />

            {/* phone */}
            <div className="h-4 w-28 bg-gray-200 rounded" />

            {/* date */}
            <div className="h-4 w-24 bg-gray-200 rounded" />

            {/* actions */}
            <div className="h-8 w-8 bg-gray-200 rounded-full ml-auto" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6 animate-pulse">
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
        <div className="w-28 h-4 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}
