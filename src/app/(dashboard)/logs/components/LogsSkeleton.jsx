"use client";

const skeletonTypes = ["created", "updated", "deleted"];

const typeStyle = {
  created: "border-blue-200",
  updated: "border-green-200",
  deleted: "border-red-200",
};

const dotStyle = {
  created: "bg-blue-500",
  updated: "bg-green-500",
  deleted: "bg-red-500",
};

export default function LogsSkeleton({ count = 7 }) {
  return (
    <div className="p-6 space-y-4">
      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-40 bg-gray-200 rounded-xl animate-pulse" />

      {/* filters skeleton */}
      <div className="p-4 rounded-2xl border bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-11 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-11 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* timeline */}
      <div className="relative">
        <div className="absolute right-[10px] top-0 bottom-0 w-[2px] bg-gray-100" />

        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => {
            const t = skeletonTypes[i % skeletonTypes.length];
            return (
              <div key={i} className="relative pr-10">
                <div
                  className={`absolute right-[2px] top-5 h-4 w-4 rounded-full ${dotStyle[t]} ring-4 ring-white`}
                />
                <div
                  className={`rounded-2xl border bg-white shadow-sm ${typeStyle[t]}`}
                >
                  <div className="p-4 flex justify-between gap-3 flex-wrap">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-72 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>

                  <div className="px-4 pb-4">
                    <div className="rounded-xl border p-3">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-3" />
                      <div className="space-y-2">
                        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                        <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                      </div>
                    </div>

                    <div className="mt-3 h-3 w-28 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
