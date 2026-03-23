"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import FormInput from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";

export default function AddBatchSubjectModal({ isOpen, onClose, subject, batchName }) {
  const initialForm = {
    subject_name: "",
    teacher_name: "",
    min_mark: "",
    max_mark: "",
    academic_year: "",
    quizzes_count: "",
    batch_name: batchName || "",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (subject) {
      setForm({
        ...subject,
        batch_name: batchName || subject.batch_name || "",
      });
    } else {
      setForm({ ...initialForm, batch_name: batchName || "" });
    }
  }, [isOpen, subject, batchName]);

  const handleSubmit = async () => {
    if (!form.subject_name) return notify.error("اسم المادة مطلوب");
    if (!form.teacher_name) return notify.error("المدرس مطلوب");

    try {
      setLoading(true);
      // Logic for adding/updating
      notify.success(subject ? "تم تعديل المادة بنجاح" : "تم إضافة المادة بنجاح");
      onClose();
    } catch (err) {
      notify.error("حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center sm:justify-end">
      <div className="w-full sm:w-[500px] bg-white h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[#8A1654] text-xl font-bold">
              {subject ? "تعديل مادة الدورة" : "إضافة مواد الدورة"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">معلومات المواد المتعلقة بهذه الدورة</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" dir="rtl">
          <FormInput
            label="المادة"
            required
            placeholder="الاسم"
            value={form.subject_name}
            onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
          />

          <SearchableSelect
            label="المدرس"
            required
            placeholder="المواد"
            value={form.teacher_name}
            options={[
              { value: "الاء", label: "الاء" },
              { value: "سنا", label: "سنا" },
              { value: "روان", label: "روان" },
            ]}
            onChange={(val) => setForm({ ...form, teacher_name: val })}
          />

          <FormInput
            label="العلامة الدنيا"
            required
            type="number"
            placeholder="المواد"
            value={form.min_mark}
            onChange={(e) => setForm({ ...form, min_mark: e.target.value })}
          />

          <FormInput
            label="العلامة العظمى"
            required
            type="number"
            placeholder="ذكر"
            value={form.max_mark}
            onChange={(e) => setForm({ ...form, max_mark: e.target.value })}
          />

          <FormInput
            label="العام الدراسي"
            required
            placeholder="ذكر"
            value={form.academic_year}
            onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
          />

          <FormInput
            label="عدد المذاكرات"
            required
            type="number"
            placeholder="ذكر"
            value={form.quizzes_count}
            onChange={(e) => setForm({ ...form, quizzes_count: e.target.value })}
          />

          <SearchableSelect
            label="الدورة"
            placeholder="ذكر"
            value={form.batch_name}
            options={[
              { value: batchName, label: batchName },
              { value: "دورة 1", label: "دورة 1" },
            ]}
            onChange={(val) => setForm({ ...form, batch_name: val })}
          />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 p-6 bg-white flex justify-start">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-2.5 bg-[#8A1654] text-white rounded-lg font-bold hover:bg-[#741046] transition disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
