"use client";
import Image from "next/image";
import { useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Total",
    count: 300,
    fill: "#FBFBFB",
  },
  {
    name: "Girls",
    count: 100,
    fill: "#D29AA3",
  },

  {
    name: "Boys",
    count: 200,
    fill: "#68C8E3",
  },
];

const style = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "24px",
};
export default function CountChart() {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="bg-transparent rounded-xl w-full h-full p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">الطلاب</h1>
      </div>
      <div className="relative w-full h-[75%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
          >
            <RadialBar background clockWise dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <p className="absolute bg-transparent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center font-semibold text-[12px] lg:text-[16px]">
          المجموع الكلي
          <span>{data[0].count}</span>
        </p>
        {hovered && (
          <div className="absolute top-1/2 -translate-y-1/2 left-4 bg-white shadow-md rounded-xl p-3 flex flex-col text-sm whitespace-nowrap">
            <span className="text-[#D29AA3] font-semibold">
              {data[1].count.toLocaleString("ar-EG")} إناث
            </span>
            <span className="text-[#68C8E3] font-semibold">
              {data[2].count.toLocaleString("ar-EG")} ذكور
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-around mt-5 gap-16">
        <div className="flex flex-row  gap-3">
          <div className="w-5 h-5 bg-[#68C8E3] rounded-full" />
          <h1 className="text-[10px] lg:text-[16px]">الذكور</h1>
        </div>
        <div className="flex flex-row gap-3">
          <div className="w-5 h-5 bg-[#D29AA3] rounded-full" />
          <h1 className="text-[10px] lg:text-[16px]">الإناث</h1>
        </div>
      </div>
    </div>
  );
}
