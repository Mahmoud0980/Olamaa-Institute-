"use client";

import React from "react";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

export default function ExamCard() {
  // بيانات الدائرة
  const data = [
    {
      name: "progress",
      value: 50,
      fill: "#FFFFFF",
    },
  ];

  return (
    <div className="relative flex items-start justify-between rounded-2xl text-white pt-2 pr-4 overflow-visible w-full bg-[#AD164C] sm:flex-row flex-col">
      {/* ====== النصوص ====== */}
      <div
        className="flex flex-col gap-2 text-right sm:w-[60%] w-full"
        dir="rtl"
      >
        <h2 className="text-[12px] sm:text-[14px] md:text-[16px] font-semibold leading-snug break-words">
          عدد المذاكرات في هذا اليوم 6
        </h2>

        <p className="text-[10px] sm:text-[11px] md:text-[12px] leading-[1.7] w-[160px] md:w-[220px] opacity-90 break-words tracking-wide">
          يعلم قسم الامتحانات أن طلاب البكالوريا سيؤدون اختبار مادة الرياضيات
          اليوم في تمام الساعة 12:23pm في القاعة 5
        </p>

        {/* ====== دائرة التقدّم ====== */}
        <div className="flex flex-col items-center md:items-end mt-3 sm:mt-0">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="80%"
                outerRadius="100%"
                barSize={4}
                data={data}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                  minAngle={15}
                  clockWise
                  dataKey="value"
                  cornerRadius={50}
                  background={{ fill: "rgba(255,255,255,0.2)" }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <span className="absolute inset-0 flex items-center justify-center text-xs sm:text-sm font-semibold">
              3/6
            </span>
          </div>
        </div>
      </div>

      {/* ====== صورة الطالبة ====== */}
      <div className="absolute -bottom-8 -left-0.5 -top-4.5 md:-top-5 w-[130px] z-20">
        <Image
          src="/wonam.svg"
          alt="طالبة"
          width={135}
          height={135}
          className="object-contain w-[195px] h-[195px] md:w-[195px] md:h-[195px]"
          priority
          loading="eager"
        />
      </div>

      {/* خلفية زهرية شفافة خفيفة */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#8F0D6D]/80 to-[#C01779]/80 -z-10 rounded-2xl" />
    </div>
  );
}
