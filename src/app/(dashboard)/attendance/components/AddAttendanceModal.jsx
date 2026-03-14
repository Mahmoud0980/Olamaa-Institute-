"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import FormInput from "@/components/common/InputField";
import GradientButton from "@/components/common/GradientButton";

// APIs
import { useGetStudentsDetailsQuery } from "@/store/services/studentsApi";
import {
  useAddManualAttendanceMutation,
  useUpdateAttendanceMutation,
} from "@/store/services/attendanceApi";

import { useGetStudentContactsSummaryQuery } from "@/store/services/contactsApi";
import { useGetMessageTemplatesQuery } from "@/store/services/messageTemplatesApi";
import { useSendSingleSmsMutation } from "@/store/services/messagesApi";

function studentFullName(s) {
  if (!s) return "";
  if (s.full_name) return s.full_name;
  const first = s.first_name || s.name || "";
  const last = s.last_name || s.family_name || s.surname || "";
  return `${first} ${last}`.trim();
}

function getSmsContactFromSummary(summaryData) {
  if (!summaryData) return null;

  const data = summaryData?.data || {};

  const allContacts = [
    ...(Array.isArray(data.personal_contacts) ? data.personal_contacts : []),
    ...(Array.isArray(data.family_contacts) ? data.family_contacts : []),
    ...(data?.full_family_summary?.primary_sms_contact
      ? [data.full_family_summary.primary_sms_contact]
      : []),
    ...(Array.isArray(data.guardians_contacts)
      ? data.guardians_contacts.flatMap((g) =>
          Array.isArray(g?.details) ? g.details : [],
        )
      : []),
  ];

  const smsOnly = allContacts.filter(
    (c) =>
      c && c.type === "phone" && c.supports_sms === true && c.full_phone_number,
  );

  const primary = smsOnly.find((c) => c.is_primary);
  return primary || smsOnly[0] || null;
}

function statusLabelArabic(status) {
  if (status === "present") return "حاضر";
  if (status === "late") return "متأخر";
  if (status === "absent") return "غائب";
  return status || "-";
}

function todayYMD() {
  return new Date().toLocaleDateString("en-CA");
}

export default function AddAttendanceModal({ isOpen, onClose, record }) {
  const isEdit = !!record;
  const total = 2;

  const [addManualAttendance] = useAddManualAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const [sendSingleSms, { isLoading: sendingMessage }] =
    useSendSingleSmsMutation();

  const { data: studentsRes } = useGetStudentsDetailsQuery(undefined, {
    skip: !isOpen,
  });
  const allStudents = studentsRes?.data || [];

  const { data: templatesRes } = useGetMessageTemplatesQuery(undefined, {
    skip: !isOpen,
  });
  const templates = Array.isArray(templatesRes?.data) ? templatesRes.data : [];

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const initialForm = {
    student_id: "",
    status: "",
  };

  const [form, setForm] = useState(initialForm);

  const [savedAttendance, setSavedAttendance] = useState(null);

  const [messageForm, setMessageForm] = useState({
    type: "sms",
    template_id: "",
    phone: "",
    message: "",
    note: "",
    lang: 0,
  });

  const selectedStudent = useMemo(() => {
    return allStudents.find((s) => String(s.id) === String(form.student_id));
  }, [allStudents, form.student_id]);

  const studentOptions = useMemo(() => {
    return (allStudents || [])
      .map((s) => {
        const label = studentFullName(s);
        if (!label) return null;
        return { value: String(s.id), label };
      })
      .filter(Boolean);
  }, [allStudents]);

  const statusOptions = [
    { value: "present", label: "حاضر" },
    { value: "late", label: "متأخر" },
    { value: "absent", label: "غائب" },
  ];

  const smsTemplates = useMemo(() => {
    return templates
      .filter((t) => t?.type === "sms" && !!t?.is_active)
      .map((t) => ({
        value: String(t.id),
        label: t.name,
      }));
  }, [templates]);

  const { data: contactsSummary, isFetching: loadingContacts } =
    useGetStudentContactsSummaryQuery(form.student_id, {
      skip: !isOpen || !form.student_id || step !== 2,
    });

  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setSavedAttendance(null);
    setMessageForm({
      type: "sms",
      template_id: "",
      phone: "",
      message: "",
      note: "",
      lang: 0,
    });

    if (record) {
      setForm({
        student_id: record?.student_id ? String(record.student_id) : "",
        status: record?.status || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, record]);

  useEffect(() => {
    if (step !== 2) return;

    const smsContact = getSmsContactFromSummary(contactsSummary);

    setMessageForm((prev) => ({
      ...prev,
      phone: smsContact?.full_phone_number || "",
    }));
  }, [contactsSummary, step]);

  useEffect(() => {
    if (messageForm.type !== "sms") return;
    if (!messageForm.template_id) return;

    const selectedTemplate = templates.find(
      (t) => String(t.id) === String(messageForm.template_id),
    );

    if (!selectedTemplate) return;

    const attendanceDate =
      savedAttendance?.attendance_date || record?.attendance_date || todayYMD();

    let body = selectedTemplate.body || "";

    body = body
      .replaceAll("{student_name}", studentFullName(selectedStudent))
      .replaceAll("{status}", statusLabelArabic(form.status))
      .replaceAll("{attendance_status}", statusLabelArabic(form.status))
      .replaceAll("{attendance_date}", attendanceDate);

    setMessageForm((prev) => ({
      ...prev,
      message: body,
    }));
  }, [
    messageForm.template_id,
    messageForm.type,
    templates,
    selectedStudent,
    form.status,
    savedAttendance,
    record,
  ]);

  const validateStep1 = () => {
    if (!form.student_id) return "يرجى اختيار الطالب";
    if (!form.status) return "يرجى اختيار الحالة";
    return null;
  };

  const validateMessageStep = () => {
    if (messageForm.type === "sms") {
      if (!messageForm.template_id) return "يرجى اختيار نموذج رسالة SMS";
      if (!messageForm.phone) return "لا يوجد رقم يدعم SMS لهذا الطالب";
      if (!messageForm.message.trim()) return "نص الرسالة مطلوب";
    }
    return null;
  };

  const handleNextFromStep1 = async () => {
    const err = validateStep1();
    if (err) {
      notify.error(err);
      return;
    }

    try {
      setLoading(true);

      let saved;

      if (!isEdit) {
        saved = await addManualAttendance({
          student_id: Number(form.student_id),
          status: form.status,
        }).unwrap();
      } else {
        saved = await updateAttendance({
          id: record.id,
          institute_branch_id: record?.institute_branch_id,
          batch_id: record?.batch_id,
          attendance_date: record?.attendance_date,
          student_id: Number(form.student_id),
          status: form.status,
        }).unwrap();
      }

      setSavedAttendance(saved?.data || saved || null);
      setStep(2);
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipMessages = () => {
    notify.success(isEdit ? "تم تعديل السجل بنجاح" : "تم تسجيل الحضور بنجاح");
    onClose?.();
  };

  const handleSendMessage = async () => {
    const err = validateMessageStep();
    if (err) {
      notify.error(err);
      return;
    }

    if (messageForm.type !== "sms") {
      notify.error("حالياً الإرسال متاح فقط للـ SMS");
      return;
    }

    try {
      await sendSingleSms({
        phone: messageForm.phone,
        message: messageForm.message,
        lang: messageForm.lang ?? 0,
      }).unwrap();

      notify.success("تم إرسال الرسالة بنجاح");
      onClose?.();
    } catch (err) {
      console.error(err);
      notify.error(err?.data?.message || "فشل في إرسال الرسالة");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start backdrop-blur-sm">
      <div
        className="w-full sm:w-[520px] bg-white h-full shadow-xl flex flex-col"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            {isEdit ? "تعديل حضور/غياب" : "تسجيل حضور/غياب"}
          </h2>
          <button onClick={onClose} type="button">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Stepper current={step} total={total} />

          {step === 1 && (
            <div className="mt-6 space-y-5">
              <SearchableSelect
                label="اسم الطالب"
                required
                value={form.student_id}
                onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
                options={studentOptions}
                placeholder="اكتب اسم الطالب..."
              />

              <SearchableSelect
                label="الحالة"
                required
                value={form.status}
                onChange={(v) => setForm((p) => ({ ...p, status: v }))}
                options={statusOptions}
                placeholder="اختر الحالة..."
              />
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                <div>
                  اسم الطالب:{" "}
                  <span className="text-gray-800 font-medium">
                    {studentFullName(selectedStudent) || "-"}
                  </span>
                </div>

                <div>
                  الحالة:{" "}
                  <span className="text-gray-800 font-medium">
                    {statusLabelArabic(form.status)}
                  </span>
                </div>

                <div>
                  التاريخ:{" "}
                  <span className="text-gray-800 font-medium">
                    {savedAttendance?.attendance_date ||
                      record?.attendance_date ||
                      todayYMD()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-5 space-y-4">
                <SearchableSelect
                  label="نوع الرسالة"
                  value={messageForm.type}
                  onChange={(v) =>
                    setMessageForm((p) => ({
                      ...p,
                      type: v,
                      template_id: "",
                      message: "",
                    }))
                  }
                  options={[
                    { value: "sms", label: "رسالة نصية (SMS)" },
                    { value: "note", label: "ملاحظة (NOTE)" },
                  ]}
                  placeholder="اختر نوع الرسالة..."
                />

                {messageForm.type === "sms" && (
                  <SearchableSelect
                    label="نموذج الرسالة"
                    value={messageForm.template_id}
                    onChange={(v) =>
                      setMessageForm((p) => ({ ...p, template_id: v }))
                    }
                    options={smsTemplates}
                    placeholder="اختر نموذج رسالة..."
                    required
                  />
                )}

                {messageForm.type === "sms" && (
                  <FormInput
                    label="رقم الهاتف"
                    value={messageForm.phone}
                    disabled
                    placeholder={
                      loadingContacts
                        ? "جارٍ تحميل رقم الهاتف..."
                        : "لا يوجد رقم يدعم SMS"
                    }
                  />
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    الرسالة
                  </label>
                  <textarea
                    rows={6}
                    value={messageForm.message}
                    onChange={(e) =>
                      setMessageForm((p) => ({
                        ...p,
                        message: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#6F013F] focus:ring-2 focus:ring-[#6F013F]/20 resize-none"
                    placeholder="اكتب الرسالة هنا"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100">
          {step === 1 ? (
            <StepButtonsSmart
              step={step}
              total={total}
              isEdit={isEdit}
              loading={loading}
              onNext={handleNextFromStep1}
              onBack={onClose}
              nextLabel="التالي"
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                رجوع
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkipMessages}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  تخطي
                </button>

                <GradientButton
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="px-5 py-2"
                >
                  {sendingMessage ? "جارٍ الإرسال..." : "إرسال"}
                </GradientButton>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
