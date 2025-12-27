"use client";

import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  description = "هل تريد بالتأكيد حذف حسابك ؟",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl px-8 py-10 text-center">
        {/* ICON */}
        <div className="flex justify-center mb-6">
          <Trash2 className="w-12 h-12 text-red-600" />
        </div>

        {/* TEXT */}
        <p className="text-gray-700 text-lg font-medium mb-8">{description}</p>

        {/* ACTIONS */}
        <div className="flex gap-4 justify-center">
          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-8 py-2 rounded-md border border-gray-300
              text-gray-700 text-sm
              hover:bg-gray-50
              disabled:opacity-50
            "
          >
            إلغاء
          </button>

          {/* Delete */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              px-8 py-2 rounded-md
              bg-red-600 text-white text-sm
              hover:bg-red-700
              disabled:opacity-50
              flex items-center justify-center gap-2
            "
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
