"use client";

import Skeleton from "@/components/common/Skeleton";

export default function StudentShortdataSkeleton() {
  return (
    <div
      dir="rtl"
      className="min-h-screen w-full bg-[#FBFBFB] px-4 md:px-6 py-6"
    >
      <div className="flex flex-col lg:flex-row-reverse gap-6 w-full">
        {/* ================= Left Side (Student Card) ================= */}
        <div className="lg:w-1/4 w-full flex flex-col gap-4">
          {/* Card */}
          <div className="bg-white  rounded-xl p-5 flex flex-col items-center gap-3">
            <Skeleton circle width={90} height={90} />
            <Skeleton width="70%" height={18} />
            <Skeleton width="90%" height={14} />
          </div>

          {/* Calendar title */}
          <Skeleton width="40%" height={16} />

          {/* Calendar */}
          <div className="bg-white  rounded-xl p-4">
            <Skeleton width="100%" height={260} />
          </div>

          {/* Edit button */}
          <div className="flex justify-end">
            <Skeleton width={110} height={40} />
          </div>
        </div>

        {/* ================= Right Side ================= */}
        <div className="lg:w-3/4 w-full flex flex-col gap-4">
          {/* Tabs + actions */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="flex gap-6">
              <Skeleton width={90} height={18} />
              <Skeleton width={110} height={18} />
              <Skeleton width={80} height={18} />
            </div>

            <div className="flex gap-2 self-end md:self-auto">
              <Skeleton width={42} height={38} />
              <Skeleton width={42} height={38} />
            </div>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-2xl p-6 w-full">
            <Skeleton width="30%" height={18} />

            <div className="mt-5 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width="100%" height={16} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
