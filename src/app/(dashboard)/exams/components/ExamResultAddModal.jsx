"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import GradientButton from "@/components/common/GradientButton";

import { useGetFilteredExamsQuery } from "@/store/services/examsApi";
import { useStudentDetailsQuery } from "@/store/services/studentDetailsApi";
import { useGetStudentContactsSummaryQuery } from "@/store/services/contactsApi";
import { useGetMessageTemplatesQuery } from "@/store/services/messageTemplatesApi";
import { useSendSingleSmsMutation } from "@/store/services/messagesApi";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function normalizeArray(res) {
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
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

export default function ExamResultAddModal({
  open,
  title = "إضافة علامة",
  loading = false,
  onClose,
  onSubmit,
  filterParams = {},
  initialData = null,
  showReason = false,
}) {
  const isEdit = !!initialData;
  const total = 2;

  const [step, setStep] = useState(1);
  const [savedResult, setSavedResult] = useState(null);

  const { data: examsRes, isLoading: loadingExams } = useGetFilteredExamsQuery(
    filterParams,
    { skip: !open },
  );

  const { data: studentsRes, isLoading: loadingStudents } =
    useStudentDetailsQuery(undefined, { skip: !open });

  const { data: templatesRes } = useGetMessageTemplatesQuery(undefined, {
    skip: !open,
  });

  const exams = useMemo(() => normalizeArray(examsRes), [examsRes]);

  const students = useMemo(() => {
    if (Array.isArray(studentsRes?.data)) return studentsRes.data;
    if (Array.isArray(studentsRes)) return studentsRes;
    return [];
  }, [studentsRes]);

  const templates = Array.isArray(templatesRes?.data) ? templatesRes.data : [];

  const smsTemplates = useMemo(() => {
    return templates
      .filter((t) => t?.type === "sms" && !!t?.is_active)
      .map((t) => ({
        value: String(t.id),
        label: t.name,
      }));
  }, [templates]);

  const examOptions = useMemo(() => {
    return exams
      .map((e) => {
        const id = e?.id ?? e?.exam_id ?? e?.examId;
        if (id == null) return null;

        const name = e?.name ?? e?.exam_type ?? "—";
        const date = e?.exam_date ?? "";

        return {
          value: String(id),
          label: `${name}${date ? ` - ${date}` : ""}`,
        };
      })
      .filter(Boolean);
  }, [exams]);

  const studentOptions = useMemo(() => {
    return students
      .filter((s) => s?.id != null)
      .map((s) => ({
        value: String(s.id),
        label: String(
          s.full_name ??
            `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() ??
            `طالب #${s.id}`,
        ).trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [students]);

  const emptyForm = useMemo(
    () => ({
      exam_id: "",
      student_id: "",
      obtained_marks: "",
      remarks: "",
      reason: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const [messageForm, setMessageForm] = useState({
    type: "sms",
    template_id: "",
    phone: "",
    message: "",
    note: "",
    lang: 0,
  });

  const { data: contactsSummary, isFetching: loadingContacts } =
    useGetStudentContactsSummaryQuery(form.student_id, {
      skip: !open || !form.student_id || step !== 2,
    });

  const [sendSingleSms, { isLoading: sendingMessage }] =
    useSendSingleSmsMutation();
  useEffect(() => {
    if (!open) return;

    setStep(1);
    setSavedResult(null);

    setMessageForm({
      type: "sms",
      template_id: "",
      phone: "",
      message: "",
      note: "",
      lang: 0,
    });
  }, [open]);

  useEffect(() => {
    if (!open || step !== 1) return;

    if (initialData) {
      setForm({
        exam_id: String(initialData.exam_id ?? ""),
        student_id: String(initialData.student_id ?? ""),
        obtained_marks:
          initialData.obtained_marks ??
          initialData.marks ??
          initialData.score ??
          "",
        remarks: initialData.remarks ?? "",
        reason: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, step, initialData, emptyForm]);

  const selectedExam = useMemo(() => {
    const id = String(form.exam_id || "");
    if (!id) return null;

    return (
      exams.find((e) => String(e?.id ?? e?.exam_id ?? e?.examId) === id) || null
    );
  }, [form.exam_id, exams]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => String(s?.id) === String(form.student_id));
  }, [students, form.student_id]);

  const totalMarks = selectedExam?.total_marks ?? null;
  const passingMarks = selectedExam?.passing_marks ?? null;

  const computedIsPassed = useMemo(() => {
    const obt = toNumOrNull(form.obtained_marks);
    const pass = toNumOrNull(passingMarks);
    if (obt == null || pass == null) return null;
    return obt >= pass;
  }, [form.obtained_marks, passingMarks]);

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

    const studentName =
      selectedStudent?.full_name ||
      `${selectedStudent?.first_name ?? ""} ${selectedStudent?.last_name ?? ""}`.trim() ||
      "";

    const examName =
      selectedExam?.name ||
      selectedExam?.exam_type ||
      savedResult?.exam_name ||
      "";

    const resultText =
      computedIsPassed == null ? "" : computedIsPassed ? "ناجح" : "راسب";

    let body = selectedTemplate.body || "";

    body = body
      .replaceAll("{student_name}", studentName)
      .replaceAll("{exam_name}", examName)
      .replaceAll("{exam_date}", selectedExam?.exam_date || "")
      .replaceAll("{obtained_marks}", String(form.obtained_marks || ""))
      .replaceAll("{result}", resultText)
      .replaceAll("{remarks}", form.remarks || "");

    setMessageForm((prev) => ({
      ...prev,
      message: body,
    }));
  }, [
    messageForm.template_id,
    messageForm.type,
    templates,
    selectedStudent,
    selectedExam,
    form.obtained_marks,
    form.remarks,
    computedIsPassed,
    savedResult,
  ]);

  const validateStep1 = () => {
    if (!form.exam_id) return "يرجى اختيار الامتحان";
    if (!form.student_id) return "يرجى اختيار الطالب";
    if (form.obtained_marks === "") return "يرجى إدخال علامة الطالب";

    const obt = Number(form.obtained_marks);
    if (!Number.isFinite(obt) || obt < 0) return "علامة الطالب غير صحيحة";

    const t = toNumOrNull(totalMarks);
    if (t != null && obt > t)
      return "علامة الطالب لا يمكن أن تتجاوز العلامة العظمى";

    if (showReason && initialData && !String(form.reason || "").trim()) {
      return "يرجى إدخال سبب التعديل";
    }

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

  const buildPayload = () => {
    return {
      exam_id: toNumOrNull(form.exam_id),
      student_id: toNumOrNull(form.student_id),
      obtained_marks: toNumOrNull(form.obtained_marks),
      is_passed: computedIsPassed ?? false,
      remarks: form.remarks || null,
      ...(showReason ? { reason: form.reason || null } : {}),
    };
  };

  const handleNextFromStep1 = async () => {
    const err = validateStep1();
    if (err) return notify.error(err);

    try {
      const payload = buildPayload();
      const res = await onSubmit?.(payload);

      setSavedResult(res || payload);
      setStep(2);
    } catch (e) {
      // التوست من الأب
    }
  };

  const handleSkipMessages = () => {
    notify.success(
      isEdit ? "تم إرسال طلب التعديل بنجاح" : "تم حفظ العلامة بنجاح",
    );
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start backdrop-blur-md">
      <div
        dir="rtl"
        className="w-full sm:w-[560px] bg-white h-full shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            {initialData ? "تعديل علامة" : title}
          </h2>

          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Stepper current={step} total={total} />

          {step === 1 && (
            <div className="mt-6 space-y-4">
              <SearchableSelect
                label="الامتحان"
                required
                value={form.exam_id}
                onChange={(v) => setForm((p) => ({ ...p, exam_id: v }))}
                options={examOptions}
                placeholder={
                  loadingExams ? "جارٍ التحميل..." : "اختر الامتحان..."
                }
                disabled={loadingExams}
                allowClear
              />

              <FormInput
                label="العلامة العظمى"
                value={totalMarks ?? "—"}
                disabled
                onChange={() => {}}
              />

              <FormInput
                label="علامة النجاح"
                value={passingMarks ?? "—"}
                disabled
                onChange={() => {}}
              />

              <SearchableSelect
                label="اسم الطالب"
                required
                value={form.student_id}
                onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
                options={studentOptions}
                placeholder={
                  loadingStudents ? "جارٍ التحميل..." : "اختر الطالب..."
                }
                disabled={loadingStudents}
                allowClear
              />

              <FormInput
                label="علامة الطالب"
                required
                placeholder="90"
                value={form.obtained_marks}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    obtained_marks: e.target.value,
                  }))
                }
              />

              <div className="text-sm">
                <span className="text-gray-500">النتيجة:</span>{" "}
                {computedIsPassed == null ? (
                  <span className="text-gray-400">—</span>
                ) : computedIsPassed ? (
                  <span className="text-green-700 font-medium">ناجح</span>
                ) : (
                  <span className="text-red-700 font-medium">راسب</span>
                )}
              </div>

              <FormInput
                label="ملاحظات"
                placeholder="ممتاز جدًا"
                value={form.remarks}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remarks: e.target.value }))
                }
              />

              {showReason && initialData && (
                <FormInput
                  label="سبب التعديل"
                  required
                  placeholder="سبب تعديل العلامة..."
                  value={form.reason}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reason: e.target.value }))
                  }
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                <div>
                  اسم الطالب:{" "}
                  <span className="text-gray-800 font-medium">
                    {selectedStudent?.full_name ||
                      `${selectedStudent?.first_name ?? ""} ${selectedStudent?.last_name ?? ""}`.trim() ||
                      "-"}
                  </span>
                </div>

                <div>
                  الامتحان:{" "}
                  <span className="text-gray-800 font-medium">
                    {selectedExam?.name || selectedExam?.exam_type || "-"}
                  </span>
                </div>

                <div>
                  التاريخ:{" "}
                  <span className="text-gray-800 font-medium">
                    {selectedExam?.exam_date || "-"}
                  </span>
                </div>

                <div>
                  النتيجة:{" "}
                  <span className="text-gray-800 font-medium">
                    {computedIsPassed == null
                      ? "-"
                      : computedIsPassed
                        ? "ناجح"
                        : "راسب"}
                  </span>
                </div>

                <div>
                  العلامة:{" "}
                  <span className="text-gray-800 font-medium">
                    {form.obtained_marks || "-"}
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

        <div className="px-6 py-4 bg-white border-t border-gray-100">
          {step === 1 ? (
            <StepButtonsSmart
              step={step}
              total={total}
              isEdit={!!initialData}
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
