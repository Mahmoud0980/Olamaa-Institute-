"use client";

import React from "react";

export default function Checkbox({
  checked,
  onChange,
  label,
  className = "",
  labelClassName = "text-xs text-gray-700",
  checkboxClassName = "w-4 h-4 accent-[#6F013F] rounded border-gray-300 focus:ring-[#6F013F] cursor-pointer",
  ...props
}) {
  return (
    <label
      className={`flex items-center gap-1.5 cursor-pointer select-none ${className}`}
    >
      <input
        type="checkbox"
        className={checkboxClassName}
        checked={checked}
        onChange={onChange}
        {...props}
      />
      {label && <span className={labelClassName}>{label}</span>}
    </label>
  );
}
