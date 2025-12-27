"use client";
import { Upload } from "lucide-react"; // أيقونة مشابهة للصورة

export default function ExcelButton({ onClick }) {
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
      <Upload size={16} />
      اكسل
    </button>
  );
}
