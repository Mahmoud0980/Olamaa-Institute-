"use client";

import { useMemo, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Avatar from "../../../../components/common/Avatar";
import "./calendarStyles.css";
import GradientButton from "@/components/common/GradientButton";
import Image from "next/image";

function getPrimaryPhone(student) {
  const guardians = student?.family?.guardians || [];
  const details = guardians.flatMap((g) => g.contact_details || []);

  const primaryPhone = details.find(
    (c) => c.type === "phone" && c.is_primary && c.full_phone_number,
  );
  if (primaryPhone) return primaryPhone.full_phone_number;

  const anyPrimary = details.find((c) => c.is_primary);
  return anyPrimary?.full_phone_number || anyPrimary?.value || "—";
}

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

// ✅ preview range بين start و hover
function inPreviewRange(d, start, hover) {
  if (!start || !hover) return false;
  const { min, max } = normalizeRange(start, hover);
  const y = toYMD(d);
  return y >= min && y <= max;
}

export default function StudentCard({
  student,
  selectedDate,
  onDateChange,
  onEditAttendance,
  activeTab,
  attendanceRange,
  paymentsRange,
  onRangeChange,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthListOpen, setMonthListOpen] = useState(false);

  // ✅ جديد: hover date لنفس تأثير المعاينة
  const [hoverDate, setHoverDate] = useState(null);

  const showCalendar = activeTab !== "info";
  const showEditButton = activeTab === "attendance";

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

  const activeRange =
    activeTab === "payments" ? paymentsRange : attendanceRange;

  const lastClickRef = useRef({ time: 0, ymd: "" });
  const DOUBLE_CLICK_MS = 450;

  const calendarValue = useMemo(() => {
    const s = activeRange?.start || null;
    const e = activeRange?.end || null;

    if (s && e) return [s, e];
    if (s && !e) return s;
    return selectedDate || null;
  }, [activeRange, selectedDate]);

  const pushRange = (range) => {
    onRangeChange?.({ tab: activeTab, range });
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

    const s = activeRange?.start || null;
    const e = activeRange?.end || null;

    if (!s || (s && e)) {
      pushRange({ start: date, end: null });
      onDateChange?.(date);
      return;
    }

    pushRange({ start: s, end: date });
    onDateChange?.(date);
  };

  // ✅ نفس منطق التلوين + preview hover
  const tileClassName = ({ date, view }) => {
    if (view !== "month") return "";

    const s = activeRange?.start || null;
    const e = activeRange?.end || null;

    if (!s && !e) return "";

    // ✅ start فقط → preview بالهوفر
    if (s && !e) {
      const base = isSameDay(date, s) ? "range-start" : "";
      const preview =
        hoverDate && inPreviewRange(date, s, hoverDate) ? "range-hover" : "";
      return [base, preview].filter(Boolean).join(" ");
    }

    // ✅ range مثبت
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
    <div className="flex flex-col gap-4 w-full">
      {/* بطاقة الطالب */}
      <div className="bg-white shadow-sm rounded-xl p-5 flex flex-col items-center text-center">
        <Avatar
          fullName={student?.full_name}
          image={student?.profile_photo_url || null}
        />
        <h2 className="font-bold mt-4">{student?.full_name}</h2>
        <p className="text-xs text-gray-500" dir="ltr">
          {getPrimaryPhone(student)}
        </p>
      </div>

      {showCalendar && (
        <>
          <div className="text-right text-sm font-semibold">التاريخ</div>

          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <div className="flex gap-2">
                <button
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
                  onClick={() => setMonthListOpen(!monthListOpen)}
                >
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </button>

                {monthListOpen && (
                  <div className="absolute right-0 bg-white border rounded shadow w-36 z-50">
                    {months.map((m, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
              className="my-calendar"
              value={calendarValue}
              onClickDay={handleDayClick}
              tileClassName={tileClassName}
              // ✅ نفس اللي عندك
              onMouseLeave={() => setHoverDate(null)}
              tileContent={({ date, view }) => {
                if (view !== "month") return null;
                return (
                  <div
                    onMouseEnter={() => setHoverDate(date)}
                    className="w-full h-full"
                  />
                );
              }}
            />
          </div>
        </>
      )}

      {showEditButton && (
        <div className="flex justify-end">
          <GradientButton
            onClick={onEditAttendance}
            rightIcon={
              <Image
                src="/icons/editbtn.png"
                alt="edit"
                width={18}
                height={18}
              />
            }
          >
            تعديل
          </GradientButton>
        </div>
      )}
    </div>
  );
}
