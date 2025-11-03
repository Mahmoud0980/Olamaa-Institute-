"use client";

import Image from "next/image";

export default function BatchesCards() {
  return (
    <section className="flex justify-between flex-row w-full  gap-4" dir="rtl">
      <div
        className="flex flex-col justify-between rounded-2xl  bg-white px-5 py-4 shadow-sm w-[180px] relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120px 120px at 90% 10%, rgba(16,163,69,0.15), transparent 60%)",
        }}
      >
        <div className="flex items-center justify-around">
          <div className="text-xl font-semibold text-gray-900">
            13 <span className="text-base font-semibold">دورة</span>
          </div>
          <Image src="/greenGlobe.svg" alt="globe" width={20} height={20} />
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">مكتملة</div>
      </div>
      <div
        className="flex flex-col justify-around rounded-2xl bg-white px-5 py-4 shadow-sm w-[180px] relative overflow-hidden"
        style={{
          background:
            "radial-gradient(120px 120px at 90% 10%, rgba(255,165,0,0.15), transparent 60%)",
        }}
      >
        <div className="flex items-center justify-around">
          <div className="text-xl font-semibold text-gray-900">
            7 <span className="text-base font-semibold">دورة</span>
          </div>
          <Image src="/orangeGlobe.svg" alt="globe" width={20} height={20} />
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">غير مكتملة</div>
      </div>
    </section>
  );
}
