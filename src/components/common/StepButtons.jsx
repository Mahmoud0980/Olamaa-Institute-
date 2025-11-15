"use client";

import { Loader2 } from "lucide-react";

export default function StepButtons({
  onNext,
  onBack,
  showNext = true,
  showBack = true,
  nextDisabled = false,
  backDisabled = false,
  nextLoading = false,
  size = "md", // sm, md, lg
}) {
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <div className="flex justify-between items-center mt-8 w-full select-none">
      {/* زر السابق */}
      {showBack ? (
        <button
          onClick={onBack}
          disabled={backDisabled}
          className={`
            flex items-center gap-2 rounded-xl border transition-all duration-200
            ${sizes[size]}
            ${
              backDisabled
                ? "cursor-not-allowed text-gray-400 border-gray-200 bg-gray-50"
                : "text-[#6F013F] border-[#F3C3D9] bg-[#FDF2F8] hover:bg-[#F9E1EE]"
            }
          `}
        >
          {/* أيقونة */}
          <span className="text-lg">«</span>
          السابق
        </button>
      ) : (
        <div />
      )}

      {/* زر التالي */}
      {showNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled || nextLoading}
          className={`
            flex items-center gap-2 rounded-xl border transition-all duration-200 font-medium
            ${sizes[size]}
            ${
              nextDisabled || nextLoading
                ? "cursor-not-allowed text-gray-400 border-gray-200 bg-gray-50"
                : "text-[#6F013F] border-[#F3C3D9] bg-white hover:bg-[#FDF2F8]"
            }
          `}
        >
          {/* في حالة التحميل */}
          {nextLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-lg">»</span>
          )}
          التالي
        </button>
      )}
    </div>
  );
}
