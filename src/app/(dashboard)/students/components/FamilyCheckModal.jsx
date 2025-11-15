"use client";

export default function FamilyCheckModal({ family, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[380px] rounded-xl shadow-xl p-6 text-center">
        <h2 className="text-lg font-semibold text-[#6F013F] mb-2">
          العائلة موجودة مسبقاً
        </h2>

        <p className="text-gray-600 text-sm mb-4">
          يوجد سجل عائلي مطابق للأسماء المدخلة.
          <br />
          هل ترغب بربط الطالب بهذه العائلة؟
        </p>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={onCancel}
            className="w-full py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            لا، متابعة تسجيل أهل جدد
          </button>

          <button
            onClick={onConfirm}
            className="w-full py-2 rounded-lg bg-[#6F013F] text-white hover:bg-[#580131] transition"
          >
            نعم، اربط الطالب
          </button>
        </div>
      </div>
    </div>
  );
}
