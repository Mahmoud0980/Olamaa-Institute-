"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useGetBatchesPerformanceQuery } from "@/store/services/statisticsApi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fmtEN = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
    : n;

function scaleBetween(minW, maxW, minVal, maxVal, w) {
  const t = Math.max(minW, Math.min(maxW, w));
  const r = (t - minW) / (maxW - minW || 1);
  return minVal + (maxVal - minVal) * r;
}

export default function BestCourseApex({
  title = "الدورة المتفوّقة",
  initialBranch = "sci",
  aspect = 364 / 150, // ✅ شوي أعلى ليعبّي الكارد
  minWidth = 280,
  maxWidth = 1280,
  minHeight = 190,
  maxHeight = 260,
  className = "",
}) {
  const [branch, setBranch] = useState(initialBranch);
  const wrapRef = useRef(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(minHeight);

  const { data: apiRows = [], isLoading } = useGetBatchesPerformanceQuery();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth || 0;
      setW(cw);
      const byAspect = cw / aspect;
      setH(Math.round(Math.max(minHeight, Math.min(maxHeight, byAspect))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect, minHeight, maxHeight]);

  // ✅ فلترة حسب الفرع + حذف 0
  const rows = useMemo(() => {
    if (!apiRows.length) return [];
    return apiRows
      .filter((r) => {
        if (branch === "sci") return r.name.includes("علمي");
        if (branch === "lit") return r.name.includes("أدبي");
        if (branch === "ninth") return r.name.includes("تاسع");
        return false;
      })
      .filter((r) => r.value > 0);
  }, [apiRows, branch]);

  const values = useMemo(() => rows.map((r) => r.value), [rows]);

  // ✅ أهم تعديل: سقف ديناميكي بدل 100
  const yMax = useMemo(() => {
    const mx = values.length ? Math.max(...values) : 0;
    if (!mx) return 10;
    // هامش + تقريب لأقرب 5
    const padded = mx + 5;
    return Math.ceil(padded / 5) * 5;
  }, [values]);

  const isPhone = w < 420;
  const isTablet = w >= 420 && w < 768;

  const dlFont = Math.max(
    12,
    Math.round(scaleBetween(minWidth, maxWidth, 10, 13, w))
  );

  const series = useMemo(() => [{ name: "النسبة", data: values }], [values]);

  const options = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        animations: { enabled: true, speed: 260 },
        // ✅ يقلل الفراغات داخل الكارد
        sparkline: { enabled: true },
      },

      grid: {
        show: false,
        padding: { top: 6, right: 6, bottom: 0, left: 6 },
      },

      plotOptions: {
        bar: {
          columnWidth: isPhone ? "68%" : isTablet ? "52%" : "42%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          // ✅ نخلي label فوق العمود لأن العمود قصير
          dataLabels: { position: "top" },
        },
      },

      // ✅ أرقام فوق العمود (واضحة)
      dataLabels: {
        enabled: true,
        formatter: (v) => fmtEN(v),
        offsetY: 0,
        style: {
          fontSize: `${dlFont}px`,
          fontWeight: 400,
          colors: ["#ffffff"],
        },
        background: { enabled: false },
        dropShadow: { enabled: false },
      },

      fill: {
        type: "gradient",
        gradient: {
          type: "vertical",
          opacityFrom: 0.95,
          opacityTo: 0.25,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: "#C01779", opacity: 0.95 },
            { offset: 100, color: "#5C0B64", opacity: 0.25 },
          ],
        },
      },

      // ❌ إخفاء أسماء تحت
      xaxis: {
        categories: rows.map((r) => r.name),
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },

      // ✅ نخلي المحور ديناميكي عشان الأعمدة تعبى الكارد
      yaxis: {
        show: false,
        min: 0,
        max: yMax,
      },

      // ✅ Hover واضح (حد + تفتيح)
      stroke: {
        show: true,
        width: 2,
        colors: ["#ffffff"],
      },
      states: {
        hover: {
          filter: { type: "lighten", value: 0.06 },
        },
        active: {
          filter: { type: "none", value: 0 },
        },
      },

      // ✅ Tooltip يظهر الاسم عند hover
      tooltip: {
        custom: ({ dataPointIndex }) => {
          const item = rows[dataPointIndex];
          if (!item) return "";
          return `
            <div style="
              padding: 10px 12px;
              background: white;
              border-radius: 10px;
              box-shadow: 0 8px 22px rgba(0,0,0,0.14);
              font-size: 12px;
              color: #3A3C40;
              direction: rtl;
              text-align: right;
              max-width: 260px;
            ">
              <div style="font-weight:700;margin-bottom:6px;line-height:1.3;">
                ${item.name}
              </div>
              <div style="color:#A0005F;font-weight:900;">
                ${fmtEN(item.value)}%
              </div>
            </div>
          `;
        },
      },

      legend: { show: false },
    }),
    [rows, values, yMax, isPhone, isTablet, dlFont]
  );

  return (
    <div dir="rtl" className={`min-w-0 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#3A3C40]">{title}</h3>

        <select
          className="rounded-xl bg-transparent px-2 py-1 text-xs focus:outline-none"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="sci">علمي</option>
          <option value="lit">أدبي</option>
          <option value="ninth">تاسع</option>
        </select>
      </div>

      <div ref={wrapRef} className="w-full overflow-hidden">
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
            جاري التحميل...
          </div>
        ) : rows.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
            لا يوجد بيانات لعرضها
          </div>
        ) : (
          <Chart
            options={options}
            series={series}
            type="bar"
            width="100%"
            height={h}
          />
        )}
      </div>
    </div>
  );
}
