"use client";

export default function CredentialsModal({ employee, onClose }) {
  if (!employee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="w-full max-w-[360px] rounded-2xl bg-white px-8 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-center text-lg font-semibold text-[#6F013F]">
          اسم المستخدم / كلمة المرور
        </h3>

        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between gap-8 text-sm">
            <span className="font-medium text-gray-700">اسم المستخدم</span>
            <span className="text-gray-500">{employee.username}</span>
          </div>

          <div className="flex items-center justify-between gap-8 text-sm">
            <span className="font-medium text-gray-700">كلمة المرور</span>
            <span className="text-gray-500">{employee.password}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mx-auto mt-8 flex h-9 w-24 items-center justify-center rounded-md bg-[#B00069] text-sm font-semibold text-white hover:opacity-90"
        >
          حفظ
        </button>
      </div>
    </div>
  );
}