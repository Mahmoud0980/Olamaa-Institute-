"use client";
import React from "react";

export default function InputField({
  label,
  placeholder,
  required,

  // controlled props (Controller/state)
  value,
  onChange,

  // react-hook-form register object: register("fieldName", rules)
  register,

  type = "text",
  error,

  readOnly = false,
  disabled = false,
  min,
  max,
  step,
}) {
  const isControlled = value !== undefined; // ✅ فقط إذا value انمررت فعلاً

  // ✅ دمج onChange (إذا موجود) مع register.onChange (إذا موجود)
  const handleChange = (e) => {
    // أولاً onChange الخارجي (مفيد للتنظيف/الفلترة)
    if (onChange) onChange(e);
    // ثم RHF
    if (register?.onChange) register.onChange(e);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm text-gray-700 font-medium">
          {label}
          {required && <span className="text-pink-600">*</span>}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full border border-gray-200 rounded-xl shadow-sm py-2.5 px-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition
          focus:border-[#D40078] focus:ring-1 focus:ring-[#F3C3D9]
          ${error ? "border-red-400" : ""}
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
        `}
        // ✅ إذا RHF register موجود: مرّره (name/ref/onBlur...)
        {...(register ? { ...register } : {})}
        // ✅ إذا controlled: مرّر value + onChange
        {...(isControlled
          ? { value: value ?? "", onChange: handleChange }
          : { onChange: handleChange })}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
