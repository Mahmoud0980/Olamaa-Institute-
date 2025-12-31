"use client";

import { Loader2 } from "lucide-react";

export default function StepButtonsSmart({
  step = 1, // الخطوة الحالية
  total = 1, // عدد كل الخطوات
  isEdit = false, // هل تعديل أم إضافة
  loading = false, // حالة التحميل
  onNext,
  onBack,
  submitLabel,
}) {
  const isSingleStep = total === 1;
  const isLastStep = step === total;

  // تحديد نص الزر تلقائياً
  let nextLabel = "التالي";

  if (total === 1) {
    // ✅ إذا في submitLabel استخدمه
    nextLabel = submitLabel ?? (isEdit ? "تعديل البيانات" : "حفظ");
  } else if (step === total) {
    nextLabel = "إنهاء";
  }

  return (
    <div className="flex justify-between items-center mt-8 w-full select-none">
      {/* زر السابق يظهر فقط إذا في أكتر من خطوة */}
      {total > 1 ? (
        <button
          onClick={onBack}
          disabled={step === 1}
          className={`
            flex items-center gap-2 px-5 py-1 rounded-md border text-sm transition
            ${
              step === 1
                ? "cursor-not-allowed text-gray-400 border-gray-200 bg-gray-50"
                : "text-[#6F013F] border-[#F3C3D9] bg-[#FDF2F8] hover:bg-[#F9E1EE]"
            }
          `}
        >
          « السابق
        </button>
      ) : (
        <div />
      )}

      {/* زر التالي / حفظ / تعديل */}
      <button
        onClick={onNext}
        disabled={loading}
        className="
          flex items-center gap-2 px-5 py-1 rounded-md border text-sm transition
          text-[#6F013F] border-[#F3C3D9] bg-white hover:bg-[#FDF2F8]
          disabled:cursor-not-allowed disabled:text-gray-400 disabled:border-gray-200 disabled:bg-gray-50
        "
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {nextLabel} »
      </button>
    </div>
  );
}
