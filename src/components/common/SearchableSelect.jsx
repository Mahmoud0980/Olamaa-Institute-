"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

export default function SearchableSelect({
  label,
  required,
  value,
  onChange,
  onAddNew,
  onQueryChange, // ✅ أضفه هنا
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
    onQueryChange?.(opt.label);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setQuery("");
    onQueryChange?.("");
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
            onQueryChange?.(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            // إذا كان النص المكتوب لا يطابق أي خيار موجود، وكان هناك onAddNew
            if (onAddNew && query.trim() && !filtered.some(f => f.label === query.trim()) && !selected) {
              // لا نفعله فوراً هنا لأنه قد يتعارض مع الضغط على زر الإضافة اليدوي
              // سننتظر قليلاً للتأكد أن المستخدم لم يضغط على خيار آخر
              setTimeout(() => {
                if (!selected && query.trim()) {
                  // onAddNew(query.trim()); // قد يسبب مشاكل تكرار
                }
              }, 200);
            }
          }}
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
          <div className="absolute right-0 left-0 top-[calc(100%+8px)] z-100 min-w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="p-1">
                <div className="px-3 py-2 text-gray-400 text-xs">لا يوجد نتائج</div>
                {onAddNew && query.trim() && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNew(query.trim());
                      setOpen(false);
                    }}
                    className="w-full text-right px-3 py-2.5 bg-pink-50 text-[#6F013F] font-medium rounded-lg hover:bg-pink-100 transition flex items-center justify-between group"
                  >
                    <span>إضافة "{query.trim()}" كجديد</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-pink-200 group-hover:border-pink-300">جديد</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-1">
                {filtered.map((opt, idx) => (
                  <button
                    key={opt.key ?? `${opt.value}-${idx}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePick(opt);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-lg transition mb-0.5
                    ${String(opt.value) === String(value)
                        ? "bg-[#6F013F] text-white"
                        : "hover:bg-pink-50 text-gray-700"}`}
                  >
                    {opt.label}
                  </button>
                ))}

                {onAddNew && query.trim() && !filtered.some(f => f.label === query.trim()) && (
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddNew(query.trim());
                        setOpen(false);
                      }}
                      className="w-full text-right px-3 py-2.5 text-[#6F013F] font-medium hover:bg-pink-50 rounded-lg transition flex items-center justify-between"
                    >
                      <span>إضافة "{query.trim()}"...</span>
                      <span className="text-[10px] text-gray-400 italic">جديد</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
