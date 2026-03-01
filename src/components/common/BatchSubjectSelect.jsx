"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function BatchSubjectSelect({
  label,
  required,
  value,
  onChange,
  options = [],
  placeholder = "اختر...",
  disabled = false,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // العنصر المختار
  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)) || null,
    [options, value],
  );

  // مزامنة الحقل مع المختار
  useEffect(() => {
    if (!selected) {
      setQuery("");
      return;
    }
    setQuery(`${selected.batch} - ${selected.subject}`);
  }, [selected]);

  // إغلاق عند الضغط خارج
  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;

    return options.filter((o) =>
      `${o.batch} ${o.subject}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  const handleSelect = (o) => {
    onChange?.(o.value);
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setQuery("");
  };

  return (
    <div className="space-y-1" dir="rtl" ref={wrapRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`relative  shadow-md rounded-xl bg-white ${
          disabled ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <div
          className="flex items-center px-3 py-2 cursor-pointer"
          onClick={() => !disabled && setOpen((p) => !p)}
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="flex-1 outline-none text-sm bg-transparent"
            disabled={disabled}
          />

          {value && (
            <button onClick={clear} type="button" className="ml-2">
              <X size={16} className="text-gray-400" />
            </button>
          )}

          <ChevronDown
            size={16}
            className={`transition-transform ${
              open ? "rotate-180" : ""
            } text-gray-500`}
          />
        </div>

        {open && (
          <div className="absolute z-50 w-full bg-white  mt-1 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">
                لا يوجد نتائج
              </div>
            )}

            {filtered.map((o) => (
              <div
                key={o.value}
                onClick={() => handleSelect(o)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer  "
              >
                <div className="text-sm font-semibold text-[#6F013F]">
                  {o.batch}
                </div>
                <div className="text-xs text-gray-500 pr-3">{o.subject}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
