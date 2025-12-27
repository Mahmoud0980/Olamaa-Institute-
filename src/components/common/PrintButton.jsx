"use client";
import { Printer } from "lucide-react";

export default function PrintButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center gap-2 
        border border-gray-900 
        bg-white 
        px-3 py-1 
        rounded-md 
        text-sm text-black 
        hover:bg-gray-100 
        transition
      "
    >
      <Printer size={16} />
      طباعة
    </button>
  );
}
