"use client";
import { useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";

const data = [
  { name: "Total", count: 300, fill: "#FBFBFB" },
  { name: "Girls", count: 100, fill: "#D29AA3" },
  { name: "Boys", count: 200, fill: "#68C8E3" },
];

export default function CountChart() {
  const [hovered, setHovered] = useState(true);

  return (
    <div className="bg-transparent rounded-xl w-full h-full p-1 sm:p-2 md:p-3">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-2 ">
        <h1 className="text-base md:text-lg font-semibold">الطلاب</h1>
      </div>

      {/* الرسم */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[320px]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={28}
            data={data}
          >
            <RadialBar background clockWise dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* النص في المنتصف */}
        <p className="absolute bg-transparent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center font-semibold text-[11px] sm:text-[13px] md:text-[16px] leading-tight text-center">
          <span>المجموع الكلي</span>
          <span className="text-[14px] sm:text-[16px] md:text-[20px]">
            {data[0].count}
          </span>
        </p>

        {/* الصندوق الجانبي */}
        {hovered && (
          <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 bg-white border border-gray-200 shadow-md rounded-xl p-2 sm:p-3 flex flex-col text-[11px] sm:text-[13px] leading-5 sm:leading-6 whitespace-nowrap">
            <span className="text-[#68C8E3] font-semibold">
              {data[2].count} ذكور
            </span>
            <span className="text-[#D29AA3] font-semibold">
              {data[1].count} إناث
            </span>
          </div>
        )}
      </div>

      {/* الأسفل (الذكور والإناث) */}
      <div className="flex justify-around ">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-[#68C8E3] rounded-full" />
          <span className="text-[10px] sm:text-[12px] md:text-[15px]">
            الذكور
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-[#D29AA3] rounded-full" />
          <span className="text-[10px] sm:text-[12px] md:text-[15px]">
            الإناث
          </span>
        </div>
      </div>
    </div>
  );
}
