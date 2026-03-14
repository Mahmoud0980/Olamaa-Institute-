"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import {
  useAddMessageTemplateMutation,
  useUpdateMessageTemplateMutation,
} from "@/store/services/messageTemplatesApi";

import { PLACEHOLDERS } from "@/lib/constants/placeholders";

export default function AddMessageTemplateModal({
  isOpen,
  onClose,
  template,
}) {
  const [addTemplate] = useAddMessageTemplateMutation();
  const [updateTemplate] = useUpdateMessageTemplateMutation();

  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const step = 1;
  const total = 1;

  const initialForm = {
    name: "",
    type: "sms",
    category: "general",
    subject: "",
    body: "",
    is_active: true,
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) return;

    if (template) {
      setForm({
        name: template.name || "",
        type: template.type || "sms",
        category: template.category || "general",
        subject: template.subject || "",
        body: template.body || "",
        is_active: !!template.is_active,
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, template]);

  const validate = () => {
    if (!form.name.trim()) return "اسم النموذج مطلوب";
    if (!form.type) return "نوع الرسالة مطلوب";
    if (!form.category) return "الفئة مطلوبة";
    if (!form.body.trim()) return "نص الرسالة مطلوب";
    return null;
  };

  const insertPlaceholder = (placeholder) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setForm((prev) => ({
        ...prev,
        body: `${prev.body}${placeholder}`,
      }));
      return;
    }

    const start = textarea.selectionStart ?? form.body.length;
    const end = textarea.selectionEnd ?? form.body.length;
    const text = form.body || "";

    const newText =
      text.substring(0, start) + placeholder + text.substring(end);

    setForm((prev) => ({
      ...prev,
      body: newText,
    }));

    setTimeout(() => {
      textarea.focus();
      const newPos = start + placeholder.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return notify.error(error);

    try {
      setLoading(true);

      const payload = {
        ...form,
      };

      if (template) {
        await updateTemplate({ id: template.id, ...payload }).unwrap();
        notify.success("تم تحديث النموذج بنجاح");
      } else {
        await addTemplate(payload).unwrap();
        notify.success("تم إضافة النموذج بنجاح");
      }

      onClose();
    } catch (err) {
      console.error(err);
      notify.error(err?.data?.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[600px] bg-white h-full shadow-xl flex flex-col">
        <div className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#6F013F] font-semibold">
              {template ? "تعديل نموذج رسالة" : "إضافة نموذج رسالة جديد"}
            </h2>
            <button onClick={onClose} type="button">
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <Stepper current={step} total={total} />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <FormInput
              label="اسم النموذج"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: تنبيه دفعة متأخرة"
            />

            <SearchableSelect
              label="نوع الرسالة"
              required
              value={form.type}
              placeholder="اختر نوع الرسالة..."
              options={[
                { value: "sms", label: "SMS" },
                { value: "whatsapp", label: "WhatsApp" },
                { value: "email", label: "Email" },
              ]}
              onChange={(val) => setForm({ ...form, type: val })}
            />

            <SearchableSelect
              label="الفئة"
              required
              value={form.category}
              placeholder="اختر الفئة..."
              options={[
                { value: "general", label: "عام" },
                { value: "payments", label: "دفعات" },
                { value: "attendance", label: "حضور وغياب" },
                { value: "exams", label: "امتحانات" },
              ]}
              onChange={(val) => setForm({ ...form, category: val })}
            />

            <FormInput
              label="الموضوع"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="موضوع الرسالة"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <label className="text-sm font-medium text-[#6F013F]">
                  نص الرسالة
                  <span className="text-red-500 mr-1">*</span>
                </label>

                <div className="flex gap-1 flex-wrap">
                  {PLACEHOLDERS.map((p, idx) => (
                    <button
                      key={p.value ?? idx}
                      type="button"
                      onClick={() => insertPlaceholder(p.value)}
                      className="px-2 py-1 text-[10px] bg-[#6F013F]/5 text-[#6F013F] border border-[#6F013F]/20 rounded-md hover:bg-[#6F013F]/10 transition-colors"
                      title={p.label}
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={8}
                className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#6F013F] focus:ring-2 focus:ring-[#6F013F]/20 resize-none"
                placeholder="اكتب نص الرسالة هنا. استخدم الأزرار أعلاه لإضافة الرموز الديناميكية."
              />

              <p className="text-[11px] text-gray-500">
                الرموز الديناميكية سيتم استبدالها بالقيم الحقيقية عند الإرسال.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#6F013F]"
                checked={!!form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <label className="text-sm text-gray-700">النموذج نشط</label>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!template}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}