"use client";
import React from "react";

/* ====== Donut مرن مع متغيّر CSS للاستجابة ====== */
function Donut({ value = 80, color = "#8F0D6D", track = "#E6E6E6" }) {
  const ring = `conic-gradient(${color} ${value * 3.6}deg, ${track} 0deg)`;
  return (
    <div
      className="relative shrink-0 justify-self-end
                 [--d:40px] sm:[--d:52px] md:[--d:64px]
                 w-[var(--d)] h-[var(--d)]"
      aria-label={`التقدّم ${value}%`}
      role="img"
    >
      <div
        className="rounded-full w-full h-full"
        style={{ backgroundImage: ring }}
      />
      {/* inset نسبي ليبقى ثابت بصريًا مع تغيّر الحجم */}
      <div
        className="absolute inset-[12%] bg-white rounded-full grid place-items-center
                   text-[clamp(9px,2.8vw,14px)] font-bold text-[#4B4B4B]"
      >
        {value}%
      </div>
    </div>
  );
}

/* ====== شارات مرنة مع متغيّر CSS ====== */
function BadgeCluster({ items }) {
  return (
    <div className="flex items-center rtl:space-x-reverse">
      {items.map((it, i) => (
        <span
          key={i}
          className="relative z-0 -ms-2 first:ms-0 inline-grid place-items-center text-white
                     [--b:18px] sm:[--b:20px] md:[--b:22px]
                     w-[var(--b)] h-[var(--b)]"
          style={{
            borderRadius: 999,
            background: it.bg,
            fontSize: "clamp(8px,1.9vw,11px)",
            fontWeight: 700,
            boxShadow: "0 0 0 2px #fff",
          }}
          title={it.title}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ====== صف الإحصائية ====== */
function StatRow({ title, desc, percent, donutColor, badges }) {
  return (
    <div
      className="
        flex flex-nowrap items-center gap-2.5 sm:gap-4
        py-3 sm:py-4
      "
    >
      {/* الشارات */}
      <div className="pe-2 shrink-0">
        <BadgeCluster items={badges} />
      </div>

      {/* النص يتمدّد ويظل ملتّفاً داخلياً */}
      <div className="min-w-0 flex-1 text-end">
        <div className="text-[clamp(12px,3vw,15px)] font-semibold text-[#3A3A3A] leading-tight">
          {title}
        </div>
        <div className="text-[clamp(10px,2.6vw,13px)] text-[#8B8B8B] leading-snug">
          {desc}
        </div>
      </div>

      {/* الدونت دائمًا على نفس السطر */}
      <div className="ms-2 shrink-0">
        <Donut value={percent} color={donutColor} />
      </div>
    </div>
  );
}

/* ====== القسم الكامل ====== */
export default function MonthlyStats() {
  const rows = [
    {
      title: "الطلاب الحاصلين على معدل 90% ومافوق",
      desc: "الطلاب الحاصلين على أعلى المعدلات في الأكاديمية",
      percent: 80,
      donutColor: "#8F0D6D",
      badges: [
        { label: "E", title: "Ex", bg: "#7C4DFF" },
        { label: "J", title: "Jr", bg: "#00BCD4" },
        { label: "A", title: "Adv", bg: "#7CB342" },
        { label: "R", title: "R", bg: "#FF9800" },
        { label: "+8", title: "أخرى", bg: "#FFC107" },
      ],
    },
    {
      title: "الطلاب المتأخرين",
      desc: "الطلاب الذين تأخروا عن الحضور في الموعد المحدّد",
      percent: 85,
      donutColor: "#59C36A",
      badges: [
        { label: "E", title: "Ex", bg: "#7C4DFF" },
        { label: "J", title: "Jr", bg: "#00BCD4" },
        { label: "A", title: "Adv", bg: "#7CB342" },
        { label: "R", title: "R", bg: "#FF9800" },
        { label: "+5", title: "أخرى", bg: "#FFC107" },
      ],
    },
    {
      title: "الرسوم الغير مدفوعة",
      desc: "الطلاب الذين لم يدفعـوا رسوماً دراسية متأخرة",
      percent: 68,
      donutColor: "#5C93FF",
      badges: [
        { label: "E", title: "Ex", bg: "#7C4DFF" },
        { label: "J", title: "Jr", bg: "#00BCD4" },
        { label: "A", title: "Adv", bg: "#7CB342" },
        { label: "R", title: "R", bg: "#FF9800" },
        { label: "+6", title: "أخرى", bg: "#FFC107" },
      ],
    },
  ];

  return (
    <section dir="ltr" className="rounded-2xl bg-transparent p-3 sm:p-4 md:p-6">
      <h2 className="text-center sm:text-end text-[clamp(15px,3.4vw,20px)] font-semibold text-[#333] mb-2">
        إحصائيات شهرية
      </h2>

      <div>
        {rows.map((r, i) => (
          <StatRow key={i} {...r} />
        ))}
      </div>
    </section>
  );
}
