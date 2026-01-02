"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function SearchableSelect({
  label,
  required,
  value,
  onChange,
  options = [],
  placeholder = "اختر...",
  allowClear = true,
  disabled = false,
}) {
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)) || null,
    [options, value]
  );

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // sync input text with selected option
  useEffect(() => {
    setQuery(selected?.label || "");
  }, [selected?.label]);

  // close on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!open) return options;
    if (!q) return options;
    return options.filter((o) => (o.label || "").toLowerCase().includes(q));
  }, [options, query, open]);

  const handlePick = (opt) => {
    onChange?.(String(opt.value));
    setQuery(opt.label);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-1" ref={wrapRef}>
      {label && (
        <label className="text-sm text-gray-700 font-medium">
          {label}
          {required && <span className="text-pink-600">*</span>}
        </label>
      )}

      <div
        className={`relative w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700
        outline-none transition focus-within:border-[#D40078] focus-within:ring-1 focus-within:ring-[#F3C3D9]
        ${disabled ? "opacity-60 pointer-events-none" : ""}`}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none pr-10"
        />

        {/* clear */}
        {allowClear && !!value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            title="مسح"
          >
            <X size={16} />
          </button>
        )}

        {/* chevron */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <ChevronDown size={18} />
        </span>

        {/* dropdown */}
        {open && (
          <div className="absolute right-0 left-0 top-[calc(100%+8px)] z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-gray-500">لا يوجد نتائج</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePick(opt);
                  }}
                  className={`w-full text-right px-3 py-2 hover:bg-pink-50 transition
                  ${String(opt.value) === String(value) ? "bg-pink-50" : ""}`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
