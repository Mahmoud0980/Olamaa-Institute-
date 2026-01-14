"use client";
import React from "react";

export default function FormInput({
  label,
  placeholder,
  required,
  value,
  onChange,
  register, // ✅ دعم قديم
  type = "text",
  error,

  // props إضافية
  readOnly = false,
  disabled = false,
  min,
  max,
  step,
}) {
  // 🧠 اختر onChange الصحيح
  const handleChange = onChange ?? register?.onChange;

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
        value={value ?? ""}
        onChange={handleChange}
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
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
