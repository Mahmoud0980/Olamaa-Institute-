"use client";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[340px] shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          هل أنت متأكد من حذف هذا الموظف؟
        </h2>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-gray-600 hover:bg-gray-100 w-[45%]"
          >
            لا
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-[#6F013F] text-white hover:bg-[#8a0650] w-[45%]"
          >
            نعم
          </button>
        </div>
      </div>
    </div>
  );
}
