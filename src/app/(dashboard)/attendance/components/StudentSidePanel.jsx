"use client";

import { useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Avatar from "@/components/common/Avatar";
import "./calendarStyles.css";

function toYMD(d) {
  return d instanceof Date ? d.toLocaleDateString("en-CA") : "";
}
function isSameDay(a, b) {
  return a && b && toYMD(a) === toYMD(b);
}
function normalizeRange(start, end) {
  const a = toYMD(start);
  const b = toYMD(end);
  if (!a || !b) return { min: "", max: "" };
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

export default function StudentSidePanel({
  student,
  selectedDate,
  onDateChange,
  attendanceRange,
  onRangeChange,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthListOpen, setMonthListOpen] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const lastClickRef = useRef({ time: 0, ymd: "" });
  const DOUBLE_CLICK_MS = 450;

  const calendarValue = useMemo(() => {
    const s = attendanceRange?.start || null;
    const e = attendanceRange?.end || null;
    if (s && e) return [s, e];
    if (s && !e) return s;
    return selectedDate || null;
  }, [attendanceRange, selectedDate]);

  const pushRange = (range) => {
    onRangeChange?.({ tab: "attendance", range });
  };

  const handleDayClick = (date) => {
    const now = Date.now();
    const ymd = toYMD(date);

    const isDouble =
      lastClickRef.current.ymd === ymd &&
      now - lastClickRef.current.time <= DOUBLE_CLICK_MS;

    lastClickRef.current = { time: now, ymd };

    if (isDouble) {
      pushRange({ start: date, end: date });
      onDateChange?.(date);
      return;
    }

    const s = attendanceRange?.start || null;
    const e = attendanceRange?.end || null;

    if (!s || (s && e)) {
      pushRange({ start: date, end: null });
      onDateChange?.(date);
      return;
    }

    pushRange({ start: s, end: date });
    onDateChange?.(date);
  };

  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const s = attendanceRange?.start || null;
    const e = attendanceRange?.end || null;

    if (!s && !e) return "";
    if (s && !e) return isSameDay(date, s) ? "range-start" : "";

    const { min, max } = normalizeRange(s, e);
    const d = toYMD(date);
    if (!min || !max || !d) return "";

    const inBetween = d >= min && d <= max;
    if (!inBetween) return "";

    const startDay = isSameDay(date, s);
    const endDay = isSameDay(date, e);

    if (startDay && endDay) return "range-start range-end range-day";
    if (startDay) return "range-start range-day";
    if (endDay) return "range-end range-day";
    return "range-day";
  };

  return (
    <div className="flex flex-col gap-3 w-full lg:sticky lg:top-4">
      {/* بطاقة الطالب (أصغر) */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center">
        <div className="scale-[0.9]">
          <Avatar
            fullName={student?.full_name || " "}
            image={student?.profile_photo_url || student?.profile_photo || null}
          />
        </div>

        <h2 className="font-semibold mt-2 text-sm">
          {student?.full_name || "—"}
        </h2>
        <p className="text-[11px] text-gray-500 truncate w-full">
          {student?.email || "—"}
        </p>
      </div>

      {/* عنوان أصغر */}
      <div className="text-right text-xs font-semibold text-gray-700">
        التاريخ
      </div>

      {/* الرزنامة (أصغر) */}
      <div className="bg-white border border-gray-200 rounded-xl p-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            <button
              className="px-2 py-1 rounded-lg border border-gray-200 text-xs hover:bg-gray-50"
              onClick={() => {
                const d = new Date(currentMonth);
                d.setMonth(d.getMonth() - 1);
                setCurrentMonth(d);
              }}
              type="button"
            >
              ❮
            </button>
            <button
              className="px-2 py-1 rounded-lg border border-gray-200 text-xs hover:bg-gray-50"
              onClick={() => {
                const d = new Date(currentMonth);
                d.setMonth(d.getMonth() + 1);
                setCurrentMonth(d);
              }}
              type="button"
            >
              ❯
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              className="text-xs font-medium text-gray-700 hover:opacity-80"
              onClick={() => setMonthListOpen(!monthListOpen)}
            >
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </button>

            {monthListOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded-xl shadow w-40 z-50 overflow-hidden">
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      const d = new Date(currentMonth);
                      d.setMonth(i);
                      setCurrentMonth(d);
                      setMonthListOpen(false);
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Calendar
          activeStartDate={currentMonth}
          locale="en"
          className="my-calendar compact-calendar"
          value={calendarValue}
          onClickDay={handleDayClick}
          tileClassName={tileClassName}
        />
      </div>
    </div>
  );
}
