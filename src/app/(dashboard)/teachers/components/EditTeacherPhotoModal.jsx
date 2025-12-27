"use client";

import { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { useUploadTeacherPhotoMutation } from "@/store/services/teachersApi";

export default function EditTeacherPhotoModal({ isOpen, onClose, teacher }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [uploadPhoto, { isLoading }] = useUploadTeacherPhotoMutation();

  useEffect(() => {
    if (!isOpen || !teacher) return;

    setFile(null);
    setPreview(teacher.profile_photo_url || null);
  }, [isOpen, teacher]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (!file) return toast.error("يرجى اختيار صورة");

    try {
      await uploadPhoto({ id: teacher.id, file }).unwrap();
      toast.success("تم تحديث صورة الأستاذ");
      onClose();
    } catch {
      toast.error("فشل رفع الصورة");
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="w-full sm:w-[420px] bg-white h-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#6F013F] font-semibold">تعديل صورة الأستاذ</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-3 mb-6">
          {preview ? (
            <img
              src={preview}
              className="w-32 h-32 rounded-full object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <span className="text-sm">{teacher.name}</span>
        </div>

        <input type="file" accept="image/*" onChange={handleFileChange} />

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
