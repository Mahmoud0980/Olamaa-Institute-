"use client";

import { X } from "lucide-react";

export default function FamilyCheckModal({
  family,
  onConfirmAttach,
  onConfirmNew,
  onClose,
  loading = false,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white w-[420px] rounded-xl shadow-xl p-6 text-center relative">
        {onClose ? (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        ) : null}

        <h2 className="text-lg font-semibold text-[#6F013F] mb-2">
          العائلة موجودة مسبقاً
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          تم العثور على عائلة مطابقة لبيانات الأب والأم.
          <br />
          هل ترغب بربط الطالب بهذه العائلة؟
        </p>

        {family?.id ? (
          <p className="text-xs text-gray-500 mb-4">Family ID: {family.id}</p>
        ) : null}

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={onConfirmNew}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-60"
          >
            لا، إنشاء عائلة جديدة
          </button>

          <button
            onClick={onConfirmAttach}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[#6F013F] text-white hover:bg-[#580131] transition disabled:opacity-60"
          >
            نعم، اربط الطالب
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-gray-500 mt-3">جارٍ المعالجة...</p>
        ) : null}
      </div>
    </div>
  );
}
