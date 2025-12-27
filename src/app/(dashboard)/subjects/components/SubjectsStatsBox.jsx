"use client";

import StatisticsCard from "@/components/statistics/StatisticsCard";

export default function SubjectsStatsBox({ subjects }) {
  const total = subjects.length;

  return (
    <div className="w-full md:w-[280px] flex flex-col gap-4">
      <StatisticsCard
        title="عدد المواد"
        value={total}
        max={100}
        color="#B0006C"
      />
    </div>
  );
}
