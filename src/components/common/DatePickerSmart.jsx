"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISO(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function fromISO(iso) {
  if (!iso) return null;
  const [y, m, d] = String(iso)
    .split("-")
    .map((x) => Number(x));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d)
    return null;
  return dt;
}

function formatDisplay(iso, format = "DD/MM/YYYY") {
  const dt = fromISO(iso);
  if (!dt) return "";
  const dd = pad2(dt.getDate());
  const mm = pad2(dt.getMonth() + 1);
  const yyyy = dt.getFullYear();
  return format === "MM/DD/YYYY"
    ? `${mm}/${dd}/${yyyy}`
    : `${dd}/${mm}/${yyyy}`;
}

function cleanTyped(raw) {
  return String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 8);
}

function applyMask(digits) {
  const a = digits.slice(0, 2);
  const b = digits.slice(2, 4);
  const c = digits.slice(4, 8);

  if (digits.length <= 2) return a;
  if (digits.length <= 4) return `${a}/${b}`;
  return `${a}/${b}/${c}`;
}

function parseTyped(masked, format = "DD/MM/YYYY") {
  const m = String(masked || "")
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;

  let p1 = Number(m[1]);
  let p2 = Number(m[2]);
  const yyyy = Number(m[3]);

  let dd, mm;

  if (format === "MM/DD/YYYY") {
    mm = p1;
    dd = p2;
  } else {
    dd = p1;
    mm = p2;
  }

  if (yyyy < 1900 || yyyy > 2100) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const dt = new Date(yyyy, mm - 1, dd);
  if (
    dt.getFullYear() !== yyyy ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== dd
  )
    return null;

  return toISO(dt);
}

const MONTHS = [
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

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function DatePickerSmart({
  label,
  value,
  onChange,
  placeholder,
  format = "DD/MM/YYYY",
  required = false,
  disabled = false,
  allowClear = true,
}) {
  const inputWrapRef = useRef(null);
  const dropdownRef = useRef(null);
  const yearListRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  // day | year
  const [mode, setMode] = useState("day");

  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 280, // ✅ أصغر
    placement: "bottom",
  });

  const [digits, setDigits] = useState("");
  const inputText = useMemo(() => applyMask(digits), [digits]);

  const selectedDate = useMemo(() => fromISO(value), [value]);
  const [view, setView] = useState(() => selectedDate || new Date());

  useEffect(() => setMounted(true), []);

  // sync input digits from value (when closed)
  useEffect(() => {
    if (!open) {
      const txt = formatDisplay(value, format);
      setDigits(cleanTyped(txt));
    }
  }, [value, format, open]);

  // when opening, snap view to selected or today
  useEffect(() => {
    if (!open) return;
    setMode("day");
    setView(selectedDate || new Date());
  }, [open, selectedDate]);

  const updatePosition = () => {
    if (!inputWrapRef.current) return;

    const rect = inputWrapRef.current.getBoundingClientRect();
    const margin = 10;

    const desiredW = 280; // ✅ أصغر كمان
    const width = Math.min(desiredW, window.innerWidth - margin * 2);

    const estimatedH = dropdownRef.current?.offsetHeight || 315; // ✅ أصغر

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldFlip = spaceBelow < estimatedH && spaceAbove > spaceBelow;

    let top = shouldFlip ? rect.top - estimatedH - 8 : rect.bottom + 8;
    let left = rect.left;

    if (left + width > window.innerWidth - margin)
      left = window.innerWidth - width - margin;
    if (left < margin) left = margin;

    if (top < margin) top = margin;
    if (top + estimatedH > window.innerHeight - margin)
      top = window.innerHeight - estimatedH - margin;

    setPos({ top, left, width, placement: shouldFlip ? "top" : "bottom" });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const selectedISO = value || "";
  const todayISO = toISO(new Date());

  // ✅ المهم: قبل الاختيار -> Active = اليوم
  const activeISO = selectedISO || todayISO;

  const daysGrid = useMemo(() => {
    const y = view.getFullYear();
    const m = view.getMonth();

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++)
      cells.push({ date: null, inMonth: false });

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(y, m, d), inMonth: true });
    }

    while (cells.length < 42) cells.push({ date: null, inMonth: false });

    return cells;
  }, [view]);

  const weeks = useMemo(() => {
    const out = [];
    for (let i = 0; i < 6; i++) out.push(daysGrid.slice(i * 7, i * 7 + 7));
    return out;
  }, [daysGrid]);

  const pickDate = (dt) => {
    const iso = toISO(dt);
    onChange?.(iso);
    setDigits(cleanTyped(formatDisplay(iso, format)));
    setOpen(false);
  };

  const goPrevMonth = () =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  const goNextMonth = () =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));

  const handleInputChange = (e) => {
    const d = cleanTyped(e.target.value);
    setDigits(d);
    setOpen(true);
  };

  const commitTyped = () => {
    const iso = parseTyped(inputText, format);
    if (iso) {
      onChange?.(iso);
      const dt = fromISO(iso);
      if (dt) setView(dt);
      return;
    }
    if (!inputText) {
      onChange?.("");
      setDigits("");
    }
  };

  const clear = (e) => {
    e?.stopPropagation?.();
    onChange?.("");
    setDigits("");
    setOpen(false);
  };

  const placeholderText =
    placeholder || (format === "MM/DD/YYYY" ? "mm/dd/yyyy" : "dd/mm/yyyy");

  // ===== Years list =====
  const years = useMemo(() => {
    const center = view.getFullYear();
    const start = center - 60;
    const end = center + 60;
    const arr = [];
    for (let y = start; y <= end; y++) arr.push(y);
    return arr;
  }, [view]);

  useEffect(() => {
    if (!open) return;
    if (mode !== "year") return;

    // scroll near current year
    const current = view.getFullYear();
    const idx = years.indexOf(current);
    if (idx < 0) return;

    requestAnimationFrame(() => {
      const el = yearListRef.current;
      if (!el) return;
      // كل زر تقريباً 34px
      el.scrollTop = Math.max(0, idx * 34 - 120);
    });
  }, [mode, open, view, years]);

  const selectYear = (y) => {
    setView((v) => new Date(y, v.getMonth(), 1));
    setMode("day");
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-gray-700 font-medium">
          {label}
          {required && <span className="text-pink-600">*</span>}
        </label>
      )}

      {/* Input */}
      <div
        ref={inputWrapRef}
        className={[
          "relative w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700",
          "outline-none transition focus-within:border-[#6F013F] focus-within:ring-1 focus-within:ring-[#F4D3E3]",
          disabled ? "opacity-60 pointer-events-none" : "",
        ].join(" ")}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          updatePosition();
        }}
      >
        <input
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => {
            setOpen(true);
            updatePosition();
          }}
          onBlur={() => {
            commitTyped();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitTyped();
              setOpen(false);
            }
          }}
          placeholder={placeholderText}
          className="w-full bg-transparent outline-none pl-10 pr-10 text-left"
          dir="ltr"
          inputMode="numeric"
        />

        {allowClear && !!value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            title="مسح"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
            setTimeout(updatePosition, 0);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          title="فتح التقويم"
        >
          <CalendarIcon size={18} />
        </button>
      </div>

      {/* Dropdown (Portal) */}
      {mounted &&
        open &&
        createPortal(
          <>
            {/* Overlay close */}
            <div
              className="fixed inset-0 z-[9998]"
              onMouseDown={() => setOpen(false)}
            />

            <div
              ref={dropdownRef}
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                position: "fixed",
              }}
              className="z-[9999]"
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="bg-white border border-gray-200 rounded-[22px] shadow-lg px-4 py-4">
                {/* Header */}
                <div className="flex items-center justify-between" dir="ltr">
                  <div className="text-[15px] font-semibold text-gray-900">
                    Calender
                  </div>

                  {/* ✅ يفتح Year Picker */}
                  <button
                    type="button"
                    onClick={() =>
                      setMode((m) => (m === "day" ? "year" : "day"))
                    }
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                    title="Years"
                  >
                    <ChevronDown size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Month row */}
                <div
                  className="mt-2 flex items-center justify-between"
                  dir="ltr"
                >
                  <div className="text-[12px] text-gray-500">
                    {MONTHS[view.getMonth()]} {view.getFullYear()}
                  </div>

                  {/* ✅ الأسهم بالشكل > < */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goNextMonth}
                      className="p-1 rounded-full hover:bg-gray-100 transition"
                      title="Next"
                    >
                      <ChevronLeft size={18} className="text-gray-500" />
                    </button>
                    <button
                      type="button"
                      onClick={goPrevMonth}
                      className="p-1 rounded-full hover:bg-gray-100 transition"
                      title="Previous"
                    >
                      <ChevronRight size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="mt-2 mb-2 h-px w-full bg-gray-200" />

                {/* BODY */}
                {mode === "year" ? (
                  <div
                    ref={yearListRef}
                    className="max-h-[220px] overflow-auto pr-1"
                  >
                    <div className="grid grid-cols-4 gap-2" dir="ltr">
                      {years.map((y) => {
                        const isCurrent = y === view.getFullYear();
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => selectYear(y)}
                            className={[
                              "h-8 rounded-xl text-[12px] transition",
                              isCurrent
                                ? "bg-[#6F013F] text-white"
                                : "border border-gray-200 text-gray-700 hover:bg-gray-50",
                            ].join(" ")}
                          >
                            {y}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-0 mb-1" dir="ltr">
                      {WEEKDAYS.map((d) => (
                        <div
                          key={d}
                          className="text-[10px] text-gray-500 font-medium text-center py-1"
                        >
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Days */}
                    <div className="space-y-1" dir="ltr">
                      {weeks.map((week, wIdx) => {
                        return (
                          <div key={wIdx} className="grid grid-cols-7 gap-0">
                            {week.map((cell, i) => {
                              const inMonth = !!cell?.inMonth && !!cell?.date;
                              if (!inMonth) {
                                return (
                                  <div key={`b-${wIdx}-${i}`} className="h-7" />
                                );
                              }

                              const iso = toISO(cell.date);

                              // ✅ الدائرة البنفسجية على activeISO (اليوم الافتراضيأو المحدد)
                              const isActive = iso === activeISO;

                              return (
                                <div
                                  key={`${iso}-${i}`}
                                  className="h-7 flex items-center justify-center p-0 m-0"
                                >
                                  <button
                                    type="button"
                                    onClick={() => pickDate(cell.date)}
                                    className={[
                                      "w-6 h-6 rounded-full flex items-center justify-center text-[12px] transition",
                                      isActive
                                        ? "bg-[#6F013F] text-white shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100",
                                    ].join(" ")}
                                    title={iso}
                                  >
                                    {cell.date.getDate()}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
