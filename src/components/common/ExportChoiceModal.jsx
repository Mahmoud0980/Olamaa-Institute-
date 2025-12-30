"use client";

import { FileSpreadsheet, Printer } from "lucide-react";

export default function ExportChoiceModal({
  isOpen,
  onClose,
  onAll,
  onCurrent,
  type = "excel", // "excel" | "print"
  loading = false,
}) {
  if (!isOpen) return null;

  const isExcel = type === "excel";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl px-8 py-10 text-center">
        {/* ICON */}
        <div className="flex justify-center mb-6">
          {isExcel ? (
            <FileSpreadsheet className="w-12 h-12 text-[#6F013F]" />
          ) : (
            <Printer className="w-12 h-12 text-[#6F013F]" />
          )}
        </div>

        {/* TEXT */}
        <p className="text-gray-700 text-lg font-medium mb-2">
          {isExcel ? "تصدير إلى إكسل" : "طباعة"}
        </p>
        <p className="text-gray-500 text-sm mb-8">
          هل تريد {isExcel ? "تصدير" : "طباعة"} الكل أم التبويب الحالي؟
        </p>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3 justify-center">
          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-6 py-2 rounded-md border border-gray-300
              text-gray-700 text-sm
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            إلغاء
          </button>

          {/* Current Tab */}
          <button
            onClick={onCurrent}
            disabled={loading}
            className="
              px-6 py-2 rounded-md
              bg-gray-200 text-gray-800 text-sm
              hover:bg-gray-300
              disabled:opacity-50
              flex items-center justify-center gap-2
            "
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
            )}
            التبويب الحالي
          </button>

          {/* All */}
          <button
            onClick={onAll}
            disabled={loading}
            className="
              px-6 py-2 rounded-md
              bg-[#6F013F] text-white text-sm
              hover:opacity-90
              disabled:opacity-50
              flex items-center justify-center gap-2
            "
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            الكل
          </button>
        </div>
      </div>
    </div>
  );
}
