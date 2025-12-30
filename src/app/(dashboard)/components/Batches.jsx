"use client";

import Image from "next/image";
import { useGetBatchesStatsQuery } from "@/store/services/statisticsApi";

export default function BatchesCards() {
  const { data, isLoading, isError } = useGetBatchesStatsQuery();

  const completed = data?.completed ?? 0;
  const notCompleted = data?.notCompleted ?? 0;

  return (
    <section className="flex justify-between flex-row w-full gap-4" dir="rtl">
      {/* ✅ مكتملة */}
      <div
        className="flex flex-col justify-between rounded-2xl bg-white px-5 py-4 shadow-sm w-[180px] relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120px 120px at 90% 10%, rgba(16,163,69,0.15), transparent 60%)",
        }}
      >
        <div className="flex items-center justify-around">
          <div className="text-xl font-semibold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
            ) : isError ? (
              0
            ) : (
              completed
            )}{" "}
            <span className="text-base font-semibold">دورة</span>
          </div>
          <Image src="/greenGlobe.svg" alt="globe" width={20} height={20} />
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">مكتملة</div>
      </div>

      {/* ✅ غير مكتملة */}
      <div
        className="flex flex-col justify-around rounded-2xl bg-white px-5 py-4 shadow-sm w-[180px] relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120px 120px at 90% 10%, rgba(255,165,0,0.15), transparent 60%)",
        }}
      >
        <div className="flex items-center justify-around">
          <div className="text-xl font-semibold text-gray-900">
            {isLoading ? (
              <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
            ) : isError ? (
              0
            ) : (
              notCompleted
            )}{" "}
            <span className="text-base font-semibold">دورة</span>
          </div>
          <Image src="/orangeGlobe.svg" alt="globe" width={20} height={20} />
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">غير مكتملة</div>
      </div>
    </section>
  );
}
