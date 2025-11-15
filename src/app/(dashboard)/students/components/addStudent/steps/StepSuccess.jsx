"use client";

import Image from "next/image";

export default function StepSuccess({ onClose, onReset }) {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center text-center py-16"
    >
      {/* الصورة */}
      <div className="relative w-[180px] h-[180px] mb-6">
        <Image
          src="/icons/success.png"
          alt="تم بنجاح"
          fill
          className="object-contain"
        />
      </div>

      {/* النص */}
      <h3 className="text-lg font-semibold text-[#6F013F] mb-2">
        تم تسجيل البيانات بنجاح
      </h3>
      <p className="text-gray-600 text-sm mb-8">
        تم حفظ جميع بيانات الطالب وولي الأمر بنجاح.
      </p>

      {/* الأزرار */}
      <div className="flex items-center justify-center gap-3">
        {/* زر الرجوع */}
        <button
          onClick={() => {
            onReset(); // ← تصفير الحقول
            onClose(); // ← إغلاق المودال
          }}
          className="px-4 py-1.5 text-sm rounded-md text-white bg-gradient-to-l from-[#D40078] to-[#6D003E] hover:opacity-95 transition"
        >
          العودة إلى القائمة
        </button>

        {/* زر الطباعة */}
        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 text-sm border border-[#D40078] text-[#6F013F] rounded-md hover:bg-pink-50 transition"
        >
          طباعة التقرير
        </button>
      </div>
    </div>
  );
}
