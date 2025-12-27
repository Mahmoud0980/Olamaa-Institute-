"use client";

import { useState, useEffect } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { resolveImageUrl } from "@/lib/helpers/image";

import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { useUploadEmployeePhotoMutation } from "@/store/services/employeesApi";

export default function EditEmployeePhotoModal({ isOpen, onClose, employee }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [uploadPhoto, { isLoading }] = useUploadEmployeePhotoMutation();

  // عند فتح المودال
  useEffect(() => {
    if (!isOpen) return;

    setFile(null);
    setPreview(resolveImageUrl(employee?.photo_path));
  }, [isOpen, employee]);

  // عند اختيار صورة
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // حفظ
  const handleSubmit = async () => {
    if (!file) {
      toast.error("يرجى اختيار صورة");
      return;
    }

    try {
      await uploadPhoto({
        id: employee.id,
        file,
      }).unwrap();

      toast.success("تم تحديث صورة الموظف بنجاح");
      onClose();
    } catch {
      toast.error("فشل رفع الصورة");
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[420px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#6F013F] font-semibold">تعديل صورة الموظف</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="flex flex-col items-center gap-3 mb-6">
          {preview ? (
            <img
              src={preview}
              alt="Employee"
              className="
                w-32 h-32 rounded-full object-cover
                border-4 border-[#F3C3D9]
                shadow-sm
              "
            />
          ) : (
            <div
              className="
                w-32 h-32 rounded-full
                flex items-center justify-center
                bg-[#FDF2F8] border border-[#F3C3D9]
              "
            >
              <ImageIcon className="w-10 h-10 text-[#6F013F]" />
            </div>
          )}

          <span className="text-sm text-gray-500">
            {employee.first_name} {employee.last_name}
          </span>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            اختر صورة جديدة
          </label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="
              w-full border border-gray-200 rounded-xl
              py-2 px-3 text-sm
              focus:border-[#D40078]
            "
          />
        </div>

        {/* Actions */}
        <StepButtonsSmart
          step={1}
          total={1}
          isEdit
          loading={isLoading}
          onNext={handleSubmit}
        />
      </div>
    </div>
  );
}
