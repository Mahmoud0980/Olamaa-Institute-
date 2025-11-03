"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Calendar from "react-calendar";
import {
  addDays,
  startOfWeek,
  startOfMonth,
  differenceInCalendarWeeks,
  getWeeksInMonth,
  format,
  isToday,
  isSameDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import Image from "next/image";

// أسبوع من الإثنين للسبت (6 أيام مثل التصميم)
const WEEK_START = 1; // Monday

export default function WeeklyCalendarCard() {
  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [lastNav, setLastNav] = useState(null); // 'prev' | 'next' | null
  const [openCal, setOpenCal] = useState(false);
  const popRef = useRef(null);

  // إغلاق منبثق التقويم عند النقر خارجاً
  useEffect(() => {
    function onDocClick(e) {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target)) setOpenCal(false);
    }
    if (openCal) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openCal]);

  const start = useMemo(
    () => startOfWeek(anchor, { weekStartsOn: WEEK_START }),
    [anchor]
  );

  const days = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(start, i)),
    [start]
  );

  const weeksInThisMonth = getWeeksInMonth(anchor, {
    weekStartsOn: WEEK_START,
  });
  const weekIndexInMonth =
    differenceInCalendarWeeks(start, startOfMonth(anchor), {
      weekStartsOn: WEEK_START,
    }) + 1;

  function handlePrev() {
    setAnchor(addDays(anchor, -7));
    setLastNav("prev");
  }
  function handleNext() {
    setAnchor(addDays(anchor, 7));
    setLastNav("next");
  }
  function handlePickDate(val) {
    const d = Array.isArray(val) ? val[0] : val;
    setAnchor(d);
    setSelected(d);
    setOpenCal(false);
  }

  const arrowBase =
    "grid place-items-center rounded-full border transition-colors " +
    // دائرة صغيرة: 16–20px حسب العرض
    "h-[clamp(16px,2vw,20px)] w-[clamp(16px,2vw,20px)] " +
    // حجم رمز السهم صغير
    "text-[clamp(10px,1.4vw,12px)] leading-none p-0";

  const arrowPrevCls =
    lastNav === "prev"
      ? "text-white border-[#7B0046] bg-[#7B0046]"
      : "text-[#7B0046] border-[#7B0046]/40 hover:bg-[#7B0046]/10";

  const arrowNextCls =
    lastNav === "next"
      ? "text-white border-[#7B0046] bg-[#7B0046]"
      : "text-[#7B0046] border-[#7B0046]/40 hover:bg-[#7B0046]/10";

  return (
    <div className="w-full">
      <div className="rounded-2xl  ">
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3"
          dir="rtl"
          ref={popRef}
        >
          <div className="text-start">
            {/* يصغر على كل المقاسات */}
            <div className="font-semibold text-black text-[clamp(12px,1.6vw,16px)]">
              التقويم الأسبوعي
            </div>
            <div className="text-[clamp(10px,1.3vw,13px)] text-[#333333] mt-0.5">
              {weekIndexInMonth}/{weeksInThisMonth} أسبوع
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-0">
            {/* Month picker */}

            <button
              type="button"
              onClick={() => setOpenCal((v) => !v)}
              className="flex items-center gap-2 rounded-md border border-gray-200 px-2.5 py-0.5 h-[clamp(30px,4vw,30px)] text-[clamp(11px,1.5vw,14px)] text-[#444] bg-transparent min-w-0"
              title="اختيار الشهر"
            >
              <span aria-hidden>
                <Image src={"/arow.svg"} width={15} height={15} alt="arow" />
              </span>
              <span className="truncate">
                {format(anchor, "MMMM yyyy", { locale: enUS })}
              </span>
            </button>

            {/* arrows */}
            <div className="flex items-end gap-2" dir="ltr">
              <button
                onClick={handlePrev}
                className={`${arrowBase} ${arrowPrevCls}`}
                aria-label="Previous week"
                type="button"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className={`${arrowBase} ${arrowNextCls}`}
                aria-label="Next week"
                type="button"
              >
                ›
              </button>
            </div>
          </div>

          {/* popover react-calendar */}
          {openCal && (
            // داخل الكارد بدل الـ absolute:
            <div className="mt-2" dir="ltr">
              <div className="absolute z-50 rounded-xl p-1 shadow-lg bg-white border">
                <Calendar
                  className="cal"
                  onChange={handlePickDate}
                  value={anchor}
                  view="month"
                  locale="en-US"
                  next2Label={null}
                  prev2Label={null}
                  showNeighboringMonth
                />
              </div>
            </div>
          )}
        </div>

        {/* Week strip — 6 أعمدة ثابتة، بدون إعادة تموضع */}
        <div className="mt-4" dir="ltr">
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {days.map((d) => {
              const active = isSameDay(d, selected);
              const today = isToday(d);
              const highlight = today && !active;

              // كبسولة اليوم
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  type="button"
                  className={[
                    "relative flex flex-col items-center justify-center rounded-lg",
                    "h-[clamp(54px,13vw,74px)] px-2",
                    "text-[clamp(11px,1.6vw,14px)]",
                  ].join(" ")}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(100deg, #6D003E 0%, #D40078 100%)",
                        }
                      : undefined
                  }
                >
                  {/* شارة اليوم الحالي إن لزم */}
                  {highlight && (
                    <span className="absolute -top-2 -right-2 h-2.5 w-2.5 rounded-full bg-[#D40078]" />
                  )}

                  <span
                    className={
                      active ? "font-medium text-white" : "text-gray-500"
                    }
                  >
                    {format(d, "EEE", { locale: enUS })}
                  </span>
                  <span className={active ? "text-white" : "text-current"}>
                    {format(d, "dd")}
                  </span>

                  {/* إطار داخلي منحني مثل اللقطة للأيام غير المفعلة */}
                  {!active && (
                    <span className="pointer-events-none absolute inset-0 rounded-2xl" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
