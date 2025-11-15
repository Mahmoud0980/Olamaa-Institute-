"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";

export default function UploadImagesField({
  label = "إرفاق صورة شخصية وصورة عن الهوية",
  setValue,
  watch,
  nameProfile = "profile_photo",
  nameId = "id_card_photo",
}) {
  const [previews, setPreviews] = useState({ profile: null, id: null });

  // مراقبة الملفات (في حال تم ضبطها عبر RHF)
  const profilePhoto = watch(nameProfile);
  const idCardPhoto = watch(nameId);

  // ✅ عند اختيار صورة جديدة
  const handleImageChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue(field, file);
    const previewUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({
      ...prev,
      [field === nameProfile ? "profile" : "id"]: previewUrl,
    }));
  };

  // ✅ حذف الصورة
  const handleRemove = (field) => {
    setValue(field, null);
    setPreviews((prev) => ({
      ...prev,
      [field === nameProfile ? "profile" : "id"]: null,
    }));
  };

  return (
    <div className="mt-6 text-right">
      {/* العنوان */}
      <label className="text-sm text-gray-700 font-medium mb-2 block">
        {label}
      </label>

      {/* الأيقونة والنص */}
      <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm">
        <Upload className="w-5 h-5" />
        <span>إرفاق صورة شخصية وصورة عن الهوية</span>
      </div>

      {/* مربعات الصور */}
      <div className="flex gap-3">
        {/* صورة شخصية */}
        <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          {previews.profile ? (
            <>
              <Image
                src={previews.profile}
                alt="صورة الطالب"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(nameProfile)}
                className="absolute top-0 right-0 bg-white/80 rounded-full text-xs px-1.5 text-red-500 hover:bg-white"
              >
                ×
              </button>
            </>
          ) : (
            <label
              htmlFor={nameProfile}
              className="cursor-pointer text-gray-400 text-sm text-center flex flex-col items-center justify-center h-full w-full"
            >
              📷
            </label>
          )}
          <input
            id={nameProfile}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, nameProfile)}
            className="hidden"
          />
        </div>

        {/* هوية */}
        <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
          {previews.id ? (
            <>
              <Image
                src={previews.id}
                alt="هوية الطالب"
                fill
                className="object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemove(nameId)}
                className="absolute top-0 right-0 bg-white/80 rounded-full text-xs px-1.5 text-red-500 hover:bg-white"
              >
                ×
              </button>
            </>
          ) : (
            <label
              htmlFor={nameId}
              className="cursor-pointer text-gray-400 text-sm text-center flex flex-col items-center justify-center h-full w-full"
            >
              🪪
            </label>
          )}
          <input
            id={nameId}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleImageChange(e, nameId)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
