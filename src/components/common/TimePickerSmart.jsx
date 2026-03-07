"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, X } from "lucide-react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function hour12To24(hour12, period) {
  let h = Number(hour12);
  if (period === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

function hour24To12(hour24) {
  const h = Number(hour24);
  if (h === 0) return 12;
  if (h > 12) return h - 12;
  return h;
}

function parseTime(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (!raw) return null;

  // 12h
  let m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const period = m[3].toUpperCase();

    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) return null;

    return {
      hour12: pad2(hh),
      minute: pad2(mm),
      period,
      formatted: `${pad2(hh)}:${pad2(mm)} ${period}`,
      hour24: pad2(hour12To24(hh, period)),
    };
  }

  // 24h
  m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hh24 = Number(m[1]);
    const mm = Number(m[2]);

    if (hh24 < 0 || hh24 > 23 || mm < 0 || mm > 59) return null;

    const period = hh24 >= 12 ? "PM" : "AM";
    const hh12 = hour24To12(hh24);

    return {
      hour12: pad2(hh12),
      minute: pad2(mm),
      period,
      formatted: `${pad2(hh12)}:${pad2(mm)} ${period}`,
      hour24: pad2(hh24),
    };
  }

  return null;
}

function formatTime(hour, minute, period) {
  return `${pad2(hour)}:${pad2(minute)} ${period}`;
}

function normalizeTyped(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .toUpperCase()
    .trimStart();
}

function WheelColumn({
  items,
  selected,
  onSelect,
  itemHeight = 36,
  maxHeight = 180,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const idx = items.findIndex((x) => String(x) === String(selected));
    if (idx < 0) return;

    requestAnimationFrame(() => {
      el.scrollTop = Math.max(0, idx * itemHeight - itemHeight * 2);
    });
  }, [items, selected, itemHeight]);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 -translate-y-1/2 rounded-xl border border-[#E8D6DF] bg-[#F9EEF4]/70"
        style={{ height: itemHeight }}
      />
      <div
        ref={ref}
        className="overflow-y-auto rounded-2xl"
        style={{ maxHeight }}
      >
        <div
          style={{ paddingTop: itemHeight * 2, paddingBottom: itemHeight * 2 }}
        >
          {items.map((item) => {
            const active = String(item) === String(selected);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(String(item))}
                className={[
                  "block w-full text-center text-sm transition",
                  active
                    ? "text-[#6F013F] font-semibold"
                    : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
                style={{ height: itemHeight }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function TimePickerSmart({
  label,
  value,
  onChange,
  placeholder = "hh:mm AM",
  required = false,
  disabled = false,
  allowClear = true,
  minuteStep = 5,
}) {
  const wrapRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 280,
  });

  const parsed = useMemo(() => parseTime(value), [value]);

  const [inputValue, setInputValue] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) return;

    const p = parseTime(value);
    if (p) {
      setInputValue(p.formatted);
      setHour(p.hour12);
      setMinute(p.minute);
      setPeriod(p.period);
    } else {
      setInputValue("");
      setHour("12");
      setMinute("00");
      setPeriod("AM");
    }
  }, [value, open]);

  useEffect(() => {
    if (!open) return;

    const p = parseTime(value);
    if (p) {
      setHour(p.hour12);
      setMinute(p.minute);
      setPeriod(p.period);
    }
  }, [open, value]);

  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad2(i + 1)),
    [],
  );

  const minutes = useMemo(() => {
    const step = Math.max(1, Number(minuteStep) || 5);
    const arr = [];
    for (let i = 0; i < 60; i += step) arr.push(pad2(i));
    return arr;
  }, [minuteStep]);

  const periods = ["AM", "PM"];

  const updatePosition = () => {
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const margin = 10;
    const desiredWidth = Math.min(rect.width, 280);
    const width = Math.min(desiredWidth, window.innerWidth - margin * 2);
    const estimatedHeight = dropdownRef.current?.offsetHeight || 230;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const flip = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    let top = flip ? rect.top - estimatedHeight - 8 : rect.bottom + 8;
    let left = rect.left;

    if (left + width > window.innerWidth - margin) {
      left = window.innerWidth - width - margin;
    }
    if (left < margin) left = margin;
    if (top < margin) top = margin;
    if (top + estimatedHeight > window.innerHeight - margin) {
      top = window.innerHeight - estimatedHeight - margin;
    }

    setPos({ top, left, width });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const commitSelection = (h = hour, m = minute, p = period, close = false) => {
    const formatted = formatTime(h, m, p);
    setInputValue(formatted);
    onChange?.(formatted);
    if (close) setOpen(false);
  };

  const handleManualBlur = () => {
    const parsedTyped = parseTime(inputValue);

    if (!inputValue.trim()) {
      onChange?.("");
      setInputValue("");
      return;
    }

    if (!parsedTyped) return;

    setHour(parsedTyped.hour12);
    setMinute(parsedTyped.minute);
    setPeriod(parsedTyped.period);
    setInputValue(parsedTyped.formatted);
    onChange?.(parsedTyped.formatted);
  };

  const clear = (e) => {
    e?.stopPropagation?.();
    setInputValue("");
    setHour("12");
    setMinute("00");
    setPeriod("AM");
    onChange?.("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-gray-700 font-medium">
          {label}
          {required && <span className="text-pink-600">*</span>}
        </label>
      )}

      <div
        ref={wrapRef}
        className={[
          "relative w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700",
          "transition focus-within:border-[#6F013F] focus-within:ring-1 focus-within:ring-[#F4D3E3]",
          disabled ? "opacity-60 pointer-events-none" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(normalizeTyped(e.target.value))}
          onFocus={() => {
            setOpen(true);
            setTimeout(updatePosition, 0);
          }}
          onBlur={handleManualBlur}
          onClick={() => {
            setOpen(true);
            setTimeout(updatePosition, 0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleManualBlur();
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none pl-10 pr-10 text-left"
          dir="ltr"
          inputMode="text"
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
          onClick={() => {
            setOpen((v) => !v);
            setTimeout(updatePosition, 0);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          title="فتح اختيار الوقت"
        >
          <Clock3 size={18} />
        </button>
      </div>

      {mounted &&
        open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onMouseDown={() => setOpen(false)}
            />

            <div
              ref={dropdownRef}
              className="z-[9999]"
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: pos.width,
              }}
            >
              <div className="rounded-[20px] border border-gray-200 bg-white p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.10)]">
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="text-[13px] font-semibold text-[#6F013F]">
                    اختر الوقت
                  </div>

                  {!!inputValue && (
                    <div className="text-[11px] text-gray-500" dir="ltr">
                      {inputValue}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2" dir="ltr">
                  <WheelColumn
                    items={hours}
                    selected={hour}
                    onSelect={(v) => {
                      setHour(v);
                      commitSelection(v, minute, period, false);
                    }}
                    itemHeight={34}
                    maxHeight={170}
                  />

                  <WheelColumn
                    items={minutes}
                    selected={minute}
                    onSelect={(v) => {
                      setMinute(v);
                      commitSelection(hour, v, period, false);
                    }}
                    itemHeight={34}
                    maxHeight={170}
                  />

                  <WheelColumn
                    items={periods}
                    selected={period}
                    onSelect={(v) => {
                      setPeriod(v);
                      commitSelection(hour, minute, v, false);
                    }}
                    itemHeight={34}
                    maxHeight={170}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={clear}
                    className="h-8 rounded-xl border border-gray-200 px-3 text-xs text-gray-700 transition hover:bg-gray-50"
                  >
                    مسح
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      commitSelection(hour, minute, period, true);
                    }}
                    className="h-8 rounded-xl bg-[#6F013F] px-3 text-xs text-white transition hover:opacity-95"
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
