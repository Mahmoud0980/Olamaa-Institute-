"use client";

import { Skeleton, SkeletonText, SkeletonCircle } from ".//Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="bg-white min-h-dvh" dir="rtl">
      {/* ===== UserCard Skeleton ===== */}
      <section className="w-full border-b border-gray-100">
        <div className="container mx-auto p-4">
          <div className="flex items-center gap-4">
            <SkeletonCircle size={56} />
            <div className="flex-1">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Grid Skeleton ===== */}
      <div className="container mx-auto p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ===== اليسار (2/3) ===== */}
          <section className="lg:col-span-2 flex flex-col gap-4 min-w-0">
            {/* الصف العلوي */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
              {/* يسار: بطاقتان */}
              <div className="flex flex-col gap-4 min-w-0">
                {/* دونات */}
                <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm">
                  <Skeleton className="h-[188px] sm:h-[200px] md:h-[220px] rounded-xl" />
                </div>
                {/* أعمدة صغيرة */}
                <div className="rounded-2xl bg-white p-3 shadow-sm">
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-[120px] rounded-xl" />
                    <Skeleton className="h-[120px] rounded-xl" />
                    <Skeleton className="h-[120px] rounded-xl" />
                  </div>
                  <SkeletonText lines={2} className="mt-3" />
                </div>
              </div>

              {/* يمين: بطاقة كبيرة */}
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Skeleton className="h-[300px] lg:h-[378px] rounded-xl" />
                <SkeletonText lines={3} className="mt-3" />
              </div>
            </div>

            {/* الصف السفلي */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
              {/* كارد يسار صغير */}
              <div className="rounded-2xl bg-white p-3 shadow-sm lg:col-span-1">
                <Skeleton className="h-[240px] sm:h-[280px] lg:h-[340px] rounded-xl" />
                <SkeletonText lines={2} className="mt-3" />
              </div>

              {/* كارد يمين عريض */}
              <div className="rounded-2xl bg-white p-3 shadow-sm lg:col-span-2">
                <Skeleton className="h-[260px] sm:h-[300px] lg:h-[344px] rounded-xl" />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Skeleton className="h-3" />
                  <Skeleton className="h-3" />
                  <Skeleton className="h-3 col-span-2" />
                </div>
              </div>
            </div>
          </section>

          {/* ===== اليمين (1/3) ===== */}
          <aside className="lg:col-span-1 flex flex-col gap-4 min-w-0">
            {/* WeeklyCalendarCard */}
            <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Batches + Notifications */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 rounded-xl" />
                  <Skeleton className="h-16 rounded-xl" />
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-28 mb-3" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <SkeletonCircle size={36} />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
