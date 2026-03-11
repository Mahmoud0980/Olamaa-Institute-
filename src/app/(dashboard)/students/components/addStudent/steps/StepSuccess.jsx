"use client";

import Image from "next/image";
import { notify } from "@/lib/helpers/toastify";
import { useDownloadStudentReportMutation } from "@/store/services/studentsApi";

export default function StepSuccess({ studentId, student, onAssignToBatch, onClose, onReset }) {
  const [downloadReport, { isLoading }] = useDownloadStudentReportMutation();

  const handleDownload = async () => {
    try {
      if (!studentId) {
        notify.error("معرف الطالب غير موجود");
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

      notify.success("تم تحميل التقرير");
    } catch (e) {
      notify.error("فشل تحميل التقرير");
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

      <div className="flex flex-col items-center justify-center gap-3 w-full max-w-xs mx-auto">
        <button
          onClick={() => {
            onReset();
            onClose();
          }}
          className="w-full px-4 py-2 text-sm rounded-md text-white bg-gradient-to-l from-[#D40078] to-[#6D003E] hover:opacity-95 transition font-medium"
        >
          العودة إلى القائمة
        </button>

        {onAssignToBatch && (
          <button
            onClick={() => onAssignToBatch(student)}
            className="w-full px-4 py-2 text-sm border border-[#D40078] text-[#D40078] rounded-md hover:bg-pink-50 transition font-medium"
          >
            إضافة الطالب لشعبة (توزيع)
          </button>
        )}

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="w-full px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition disabled:opacity-60"
        >
          {isLoading ? "جاري التحميل..." : "تحميل تقرير الطالب (Docx)"}
        </button>
      </div>
    </div>
  );
}
