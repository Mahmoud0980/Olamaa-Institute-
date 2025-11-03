"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const BRANCHES = {
  sci: [
    { label: "بنات", count: 24, value: 60.7 },
    { label: "شباب", count: 34, value: 70.1 },
    { label: "بنات", count: 22, value: 60.7 },
    { label: "شباب", count: 13, value: 60.7 },
    { label: "بنات", count: 44, value: 60.7 },
    { label: "شباب", count: 33, value: 45.2 },
    { label: "شباب", count: 55, value: 50.0 },
    { label: "شباب", count: 44, value: 60.7 },
  ],
  lit: [
    { label: "بنات", count: 18, value: 52.3 },
    { label: "شباب", count: 21, value: 48.2 },
    { label: "بنات", count: 27, value: 61.1 },
    { label: "شباب", count: 16, value: 55.4 },
  ],
  ninth: [
    { label: "A", count: 30, value: 72.5 },
    { label: "B", count: 28, value: 66.4 },
    { label: "C", count: 25, value: 58.9 },
  ],
};

const fmtEN = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : n;

// دالة مساعدة للقياس بين حدّين
function scaleBetween(minW, maxW, minVal, maxVal, w) {
  const t = Math.max(minW, Math.min(maxW, w));
  const r = (t - minW) / (maxW - minW || 1);
  return minVal + (maxVal - minVal) * r;
}

export default function BestCourseApex({
  title = "الدورة المتفوّقة",
  initialBranch = "sci",
  aspect = 364 / 125,
  minWidth = 280,
  maxWidth = 1280, // وسّعت الحد الأعلى ليكون القياس أنعم على الشاشات العريضة
  minHeight = 160,
  maxHeight = 320,
  className = "",
}) {
  const [branch, setBranch] = useState(initialBranch);
  const wrapRef = useRef(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(minHeight);

  // راقب عرض الحاوية واحسب ارتفاعًا مناسبًا بدون انكماش زائد
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth || 0;
      setW(cw);
      const byAspect = cw / aspect;
      const clamped = Math.max(minHeight, Math.min(maxHeight, byAspect));
      setH(Math.round(clamped));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect, minHeight, maxHeight]);

  const rows = BRANCHES[branch] ?? [];

  const isPhone = w < 420;
  const isTablet = w >= 420 && w < 768;

  // مقاسات متكيفة
  const xFont = Math.round(scaleBetween(minWidth, maxWidth, 9, 12, w));
  const yFont = Math.round(scaleBetween(minWidth, maxWidth, 9, 12, w));
  const dlFont = Math.max(
    8,
    Math.round(scaleBetween(minWidth, maxWidth, 9, 14, w))
  );
  const dlPosition = isPhone ? "top" : "center";
  const dlOffsetY = isPhone ? -1 : 0;
  const colWidth = isPhone ? "78%" : isTablet ? "60%" : "46%";

  const categoryFormatter = (val, opts) => {
    // بالموبايل نعرض الاسم فقط لتقليل الارتفاع، وعلى الشاشات الأكبر اسم + عدد بسطرين
    const i = opts?.dataPointIndex ?? -1;
    const item = rows[i];
    if (!item) return val;
    return isPhone ? `${item.label}` : `${item.label}\n${item.count}`;
  };

  const series = useMemo(
    () => [{ name: "النسبة", data: rows.map((r) => r.value) }],
    [rows]
  );

  const options = useMemo(
    () => ({
      chart: {
        type: "bar",
        toolbar: { show: false },
        animations: { enabled: true, speed: 250 },
        sparkline: { enabled: false },
        // محاذاة نصوص RTL عبر CSS للفئات
        foreColor: "#3A3C40",
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: colWidth,
          borderRadius: 3,
          borderRadiusApplication: "end",
          dataLabels: { position: dlPosition }, // top | center | bottom
        },
      },
      dataLabels: {
        enabled: true,
        position: dlPosition, // "top" على الموبايل / "center" على الأكبر
        offsetY: dlOffsetY,
        formatter: (val) => fmtEN(val),
        style: {
          fontSize: `${dlFont}px`,
          fontWeight: 700,
          // أبيض عند الكتابة داخل العمود، ورمادي غامق فوق الأعمدة
          colors: [dlPosition === "center" ? "#FFFFFF" : "#fff"],
        },
        background: {
          enabled: false, // ✅ إلغاء الدائرة/الخلفية تمامًا
        },
        dropShadow: {
          enabled: false, // للتأكيد ما في ظل حول الأرقام
        },
      },

      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.8,
          opacityFrom: 0.95,
          opacityTo: 0.15,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: "#C01779", opacity: 0.95 },
            { offset: 50, color: "#8F0D6D", opacity: 0.55 },
            { offset: 100, color: "#5C0B64", opacity: 0.15 },
          ],
        },
      },
      colors: ["#C01779"],
      xaxis: {
        categories: rows.map((r) => r.label), // سنعيد كتابة النص عبر formatter
        labels: {
          show: true,
          formatter: categoryFormatter,
          style: { fontSize: `${xFont}px`, colors: "#6b7280", fontWeight: 600 },
          offsetY: 2,
          trim: true,
        },
        axisBorder: { show: true, color: "#e5e7eb" },
        axisTicks: { show: false },
        tooltip: { enabled: false },
      },
      yaxis: {
        show: !isPhone,
        max: 100,
        tickAmount: isTablet ? 4 : 5,
        decimalsInFloat: 0,
        labels: {
          style: { fontSize: `${yFont}px`, colors: "#6b7280", fontWeight: 500 },
          formatter: (v) => fmtEN(v),
          offsetX: -6,
          offsetY: 2,
        },
      },
      grid: {
        borderColor: "#eef2f7",
        strokeDashArray: 0,
        yaxis: { lines: { show: !isPhone } },
        xaxis: { lines: { show: false } },
        padding: isPhone
          ? { left: 4, right: 4, top: 2, bottom: 0 }
          : { left: 10, right: 10, top: 6, bottom: 2 },
      },
      tooltip: {
        y: { formatter: (v) => `${fmtEN(v)}%` },
        x: {
          formatter: (_v, { dataPointIndex }) => {
            const item = rows[dataPointIndex];
            return item ? `${item.label} • ${item.count}` : "";
          },
        },
      },
      legend: { show: false },
      // تمكين كسر السطر في عناوين المحور السفلي ل RTL
      // (نضيف كلاس على SVG لنجبر المحاذاة يمين)
      // سنضيفه عبر CSS inline أدناه
    }),
    [
      rows,
      w,
      xFont,
      yFont,
      dlFont,
      dlOffsetY,
      isPhone,
      isTablet,
      dlPosition,
      colWidth,
    ]
  );

  return (
    <div dir="rtl" className={`min-w-0 ${className}`}>
      {/* رأس الكارد */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[clamp(12px,1.4vw,14px)] font-semibold text-[#3A3C40]">
          {title}
        </h3>

        <label className="inline-flex items-center gap-2 text-[clamp(11px,1.2vw,12px)] text-slate-500">
          <select
            className="rounded-xl bg-transparent px-2 py-1 text-xs focus:outline-none"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            <option value="sci">علمي</option>
            <option value="lit">أدبي</option>
            <option value="ninth">تاسع</option>
          </select>
        </label>
      </div>

      {/* الحاوية المرنة */}
      <div ref={wrapRef} className="w-full overflow-hidden min-w-0">
        {/* CSS صغير لضمان محاذاة يمين لكلمات المحور السفلي ودعم السطرين */}
        <style jsx global>{`
          .apexcharts-xaxis text {
            direction: rtl;
            text-anchor: end !important;
            white-space: pre-line; /* يسمح بكسر السطر */
          }
        `}</style>

        <Chart
          options={options}
          series={series}
          type="bar"
          width="100%"
          height={h}
        />
      </div>
    </div>
  );
}
