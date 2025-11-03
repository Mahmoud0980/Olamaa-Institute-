// components/AttendanceCard.js
"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function AttendanceCard({ value = 80, totalLabel = "Day 345" }) {
  const options = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        sparkline: { enabled: true },
        toolbar: { show: false },
      },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: {
            size: "45%", // أصغر = قوس أعرض
          },
          track: {
            background: "#D1D1D1", // الخلفية الرمادية
            strokeWidth: "100%",
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              fontSize: "28px",
              fontWeight: 700,
              color: "#4B4B4B",
              offsetY: 10,
              formatter: (val) => `${Math.round(val)}%`,
            },
          },
        },
      },
      fill: {
        type: "solid",
        colors: ["#7B0046"], // لون القوس
      },
      stroke: {
        lineCap: "round",
      },
    }),
    []
  );

  const series = [value];

  return (
    <div className="h-full w-full rounded-2xl bg-transparent p-0">
      <div className="flex h-full flex-col items-center justify-between p-0">
        {/* العناوين */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-[#333]">الغياب</h3>
          <p className="text-sm text-gray-400">إجمالي الغياب</p>
          <p className="text-lg font-bold text-[#AD164C]">{totalLabel}</p>
          <p className="text-sm leading-6 text-gray-400 mt-1">
            الغياب هذا الأسبوع أعلى بنسبة 28%
            <br />
            من الأسبوع الماضي
          </p>
        </div>

        {/* الشارت فقط */}
        <div className="w-full max-w-[240px]">
          <Chart
            options={options}
            series={series}
            type="radialBar"
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
