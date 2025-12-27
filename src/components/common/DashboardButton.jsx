"use client";

import React from "react";

export default function DashboardButton({
  label,
  icon,
  onClick,
  color = "pink",
  className = "",
}) {
  const styles = {
    pink: "bg-[#F9E8F0] text-[#6F013F] hover:bg-[#f4d3e3]",
    green: "bg-[#E5F5E9] text-[#2F8F46] hover:bg-[#D8F0DE]",
    gray: "bg-[#F6E5FF] text-gray-700 hover:bg-[#D993FF]",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 rounded-md text-sm flex items-center gap-2 transition cursor-pointer 
        ${styles[color]} ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}
