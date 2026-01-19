"use client";

import Image from "next/image";
import toast from "react-hot-toast";
import { useDownloadStudentReportMutation } from "@/store/services/studentsApi";

export default function StepSuccess({ studentId, onClose, onReset }) {
  const [downloadReport, { isLoading }] = useDownloadStudentReportMutation();

  const handleDownload = async () => {
    try {
      if (!studentId) {
        toast.error("معرف الطالب غير موجود");
        return;
      }

      const blob = await downloadReport(studentId).unwrap();

      // ✅ تنزيل ملف
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `student-report-${studentId}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("تم تحميل التقرير");
    } catch (e) {
      toast.error("فشل تحميل التقرير");
    }
  };

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center text-center py-16"
    >
      <div className="relative w-[180px] h-[180px] mb-6">
        <Image
          src="/icons/success.png"
          alt="تم بنجاح"
          fill
          className="object-contain"
        />
      </div>

      <h3 className="text-lg font-semibold text-[#6F013F] mb-2">
        تم تسجيل البيانات بنجاح
      </h3>
      <p className="text-gray-600 text-sm mb-8">
        تم حفظ جميع بيانات الطالب وولي الأمر بنجاح.
      </p>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            onReset();
            onClose();
          }}
          className="px-4 py-1.5 text-sm rounded-md text-white bg-gradient-to-l from-[#D40078] to-[#6D003E] hover:opacity-95 transition"
        >
          العودة إلى القائمة
        </button>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="px-4 py-1.5 text-sm border border-[#D40078] text-[#6F013F] rounded-md hover:bg-pink-50 transition disabled:opacity-60"
        >
          {isLoading ? "جاري التحميل..." : "طباعة التقرير"}
        </button>
      </div>
    </div>
  );
}
