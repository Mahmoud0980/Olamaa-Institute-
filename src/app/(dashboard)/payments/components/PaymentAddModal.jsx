"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import DatePickerSmart from "@/components/common/DatePickerSmart";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetStudentContactsSummaryQuery } from "@/store/services/contactsApi";
import { useGetMessageTemplatesQuery } from "@/store/services/messageTemplatesApi";
//import { useSendSingleMessageMutation } from "@/store/services/messagesApi";
import { useSendSingleSmsMutation } from "@/store/services/messagesApi";
import GradientButton from "@/components/common/GradientButton";
import { debugLogger } from "@/lib/helpers/debugLogger";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
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

export default function PaymentAddModal({
  open,
  title = "إضافة دفعة",
  loading = false,
  onClose,
  onSubmit,
  students = [],
  defaultInstituteBranchId = "",
  initialData = null,
  showReason = false,
}) {
  const isEdit = !!initialData;
  // const total = isEdit ? 1 : 2;
  const total = 2;

  const safeStudents = useMemo(() => {
    if (Array.isArray(students)) return students;
    if (Array.isArray(students?.data)) return students.data;
    return [];
  }, [students]);

  const { data: branchesRes, isLoading: loadingBranches } =
    useGetInstituteBranchesQuery();

  const branches = useMemo(() => {
    const arr = branchesRes?.data;
    return Array.isArray(arr) ? arr : [];
  }, [branchesRes]);

  const branchOptions = useMemo(() => {
    return branches
      .filter((b) => b && b.id != null)
      .map((b) => ({
        value: String(b.id),
        label: String(b.name ?? "").trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [branches]);

  const currencyOptions = useMemo(
    () => [
      { value: "USD", label: "USD" },
      { value: "SYP", label: "SYP" },
    ],
    [],
  );

  const emptyForm = useMemo(
    () => ({
      receipt_number: "",
      institute_branch_id: defaultInstituteBranchId
        ? String(defaultInstituteBranchId)
        : "",
      student_id: "",
      currency: "USD",
      amount_usd: "",
      amount_syp: "",
      exchange_rate_at_payment: "",
      paid_date: "",
      description: "",
      reason: "",
    }),
    [defaultInstituteBranchId],
  );

  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(1);

  const [savedPayment, setSavedPayment] = useState(null);

  const [messageForm, setMessageForm] = useState({
    type: "sms",
    template_id: "",
    phone: "",
    message: "",
    note: "",
    lang: 0,
  });

  const { data: templatesRes } = useGetMessageTemplatesQuery(undefined, {
    skip: !open,
  });

  const templates = Array.isArray(templatesRes?.data) ? templatesRes.data : [];

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
      skip: !open || !form.student_id || step !== 2,
    });

  // const [sendSingleMessage, { isLoading: sendingMessage }] =
  //   useSendSingleMessageMutation();
  const [sendSingleSms, { isLoading: sendingMessage }] =
    useSendSingleSmsMutation();

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setSavedPayment(null);

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
        receipt_number: initialData.receipt_number ?? "",
        institute_branch_id: String(initialData.institute_branch_id ?? ""),
        student_id: String(initialData.student_id ?? ""),
        currency: initialData.currency ?? "USD",
        amount_usd: initialData.amount_usd ?? "",
        amount_syp: initialData.amount_syp ?? "",
        exchange_rate_at_payment: initialData.exchange_rate_at_payment ?? "",
        paid_date: initialData.paid_date ?? "",
        description: initialData.description ?? "",
        reason: "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, step, initialData, emptyForm]);

  const filteredStudents = useMemo(() => {
    const bid = String(form.institute_branch_id || "");
    if (!bid) return [];
    return safeStudents.filter((s) => {
      const sid1 = s?.institute_branch_id;
      const sid2 = s?.institute_branch?.id;
      return String(sid1 ?? sid2 ?? "") === bid;
    });
  }, [safeStudents, form.institute_branch_id]);

  const studentOptions = useMemo(() => {
    return filteredStudents
      .filter((s) => s && s.id != null)
      .map((s) => ({
        value: String(s.id),
        label: String(
          s.full_name ??
            s.fullName ??
            `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() ??
            `طالب #${s.id}`,
        ).trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [filteredStudents]);

  const selectedStudent = useMemo(() => {
    return safeStudents.find((s) => String(s?.id) === String(form.student_id));
  }, [safeStudents, form.student_id]);

  useEffect(() => {
    if (!open) return;
    if (!form.student_id) return;

    const bid = String(form.institute_branch_id || "");
    if (!bid) {
      setForm((p) => ({ ...p, student_id: "" }));
      return;
    }

    const current = safeStudents.find(
      (s) => String(s?.id) === String(form.student_id),
    );
    if (!current) {
      setForm((p) => ({ ...p, student_id: "" }));
      return;
    }

    const currentBid = String(
      current?.institute_branch_id ?? current?.institute_branch?.id ?? "",
    );

    if (currentBid && currentBid !== bid) {
      setForm((p) => ({ ...p, student_id: "" }));
    }
  }, [open, form.institute_branch_id, form.student_id, safeStudents]);

  useEffect(() => {
    if (!open) return;

    setForm((p) => {
      if (p.currency === "USD") {
        return { ...p, amount_syp: "", exchange_rate_at_payment: "" };
      }
      return { ...p, amount_usd: "" };
    });
  }, [open, form.currency]);

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

    let body = selectedTemplate.body || "";

    const amount =
      form.currency === "USD"
        ? `${form.amount_usd || 0}$`
        : `${form.amount_syp || 0} ل.س`;

    const studentName =
      selectedStudent?.full_name ||
      selectedStudent?.fullName ||
      `${selectedStudent?.first_name || ""} ${selectedStudent?.last_name || ""}`.trim() ||
      "";

    body = body
      .replaceAll("{student_name}", studentName)
      .replaceAll("{amount}", amount)
      .replaceAll("{paid_date}", form.paid_date || "")
      .replaceAll("{receipt_number}", form.receipt_number || "");

    setMessageForm((prev) => ({
      ...prev,
      message: body,
    }));
  }, [
    messageForm.template_id,
    messageForm.type,
    templates,
    form.currency,
    form.amount_usd,
    form.amount_syp,
    form.paid_date,
    form.receipt_number,
    selectedStudent,
  ]);

  const validateStep1 = () => {
    if (!form.receipt_number.trim()) return "رقم الإيصال مطلوب";
    if (!form.institute_branch_id) return "يرجى اختيار فرع المعهد";
    if (!form.student_id) return "يرجى اختيار الطالب";
    if (!form.paid_date) return "يرجى إدخال تاريخ الدفع";
    if (!form.currency) return "يرجى اختيار العملة";

    if (form.currency === "USD") {
      if (!form.amount_usd) return "يرجى إدخال مبلغ USD";
    } else {
      if (!form.amount_syp) return "يرجى إدخال مبلغ ل.س";
      if (!form.exchange_rate_at_payment) return "يرجى إدخال سعر الصرف";
    }

    if (showReason && initialData && !form.reason.trim())
      return "يرجى إدخال سبب التعديل";

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

  const buildPaymentPayload = () => {
    const isUSD = form.currency === "USD";

    return {
      receipt_number: form.receipt_number || null,
      institute_branch_id: toNumOrNull(form.institute_branch_id),
      student_id: toNumOrNull(form.student_id),
      amount_usd: isUSD ? toNumOrNull(form.amount_usd) : null,
      amount_syp: !isUSD ? toNumOrNull(form.amount_syp) : null,
      exchange_rate_at_payment: !isUSD
        ? toNumOrNull(form.exchange_rate_at_payment)
        : null,
      currency: form.currency || "USD",
      paid_date: form.paid_date || null,
      description: form.description || null,
      ...(showReason ? { reason: form.reason || null } : {}),
    };
  };

  const handleNextFromStep1 = async () => {
    const err = validateStep1();
    if (err) {
      notify.error(err, "خطأ");
      return;
    }

    const payload = buildPaymentPayload();

    try {
      const saved = await onSubmit?.(payload);
      setSavedPayment(saved || payload);
      setStep(2);
    } catch (e) {
      console.error(e);
      debugLogger.error(e, "Payment Submission");
      notify.error(e?.data?.message || e?.message || "فشل في حفظ الدفعة");
    }
  };

  const handleSkipMessages = () => {
    notify.success(
      isEdit ? "تم إرسال طلب التعديل بنجاح" : "تم حفظ الدفعة بنجاح",
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
      debugLogger.error(err, "SMS Sending");
      if (err?.data?.errors) {
        Object.values(err.data.errors)
          .flat()
          .forEach((msg) => notify.error(msg));
      } else {
        notify.error(err?.data?.message || err?.message || "فشل في إرسال الرسالة");
      }
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
            {initialData ? "تعديل دفعة" : title}
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
              <FormInput
                label="رقم الإيصال"
                placeholder="REC-001"
                value={form.receipt_number}
                onChange={(e) =>
                  setForm((p) => ({ ...p, receipt_number: e.target.value }))
                }
              />

              <SearchableSelect
                label="فرع المعهد"
                required
                value={form.institute_branch_id}
                onChange={(v) =>
                  setForm((p) => ({ ...p, institute_branch_id: v }))
                }
                options={branchOptions}
                placeholder={
                  loadingBranches ? "جارٍ التحميل..." : "اختر الفرع..."
                }
                disabled={loadingBranches}
                allowClear
              />

              <SearchableSelect
                label="الطالب"
                required
                value={form.student_id}
                onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
                options={studentOptions}
                placeholder={
                  form.institute_branch_id
                    ? studentOptions.length
                      ? "اختر الطالب..."
                      : "لا يوجد طلاب بهذا الفرع"
                    : "اختر الفرع أولاً"
                }
                disabled={!form.institute_branch_id}
                allowClear
              />

              <SearchableSelect
                label="العملة"
                required
                value={form.currency}
                onChange={(v) => setForm((p) => ({ ...p, currency: v }))}
                options={currencyOptions}
                placeholder="اختر العملة..."
                allowClear
              />

              <DatePickerSmart
                label="تاريخ الدفع"
                required
                value={form.paid_date}
                onChange={(iso) => setForm((p) => ({ ...p, paid_date: iso }))}
                placeholder="dd/mm/yyyy"
              />

              {form.currency === "USD" && (
                <FormInput
                  label="المبلغ بالدولار"
                  required
                  placeholder="100"
                  value={form.amount_usd}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount_usd: e.target.value }))
                  }
                />
              )}

              {form.currency === "SYP" && (
                <>
                  <FormInput
                    label="المبلغ بالليرة"
                    required
                    placeholder="1000000"
                    value={form.amount_syp}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, amount_syp: e.target.value }))
                    }
                  />

                  <FormInput
                    label="سعر الصرف"
                    required
                    placeholder="10000"
                    value={form.exchange_rate_at_payment}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        exchange_rate_at_payment: e.target.value,
                      }))
                    }
                  />
                </>
              )}

              <FormInput
                label="الوصف"
                placeholder="دفعة نقدًا..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />

              {showReason && initialData && (
                <FormInput
                  label="سبب التعديل"
                  required
                  placeholder="سبب تعديل الدفعة..."
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
                      selectedStudent?.fullName ||
                      `${selectedStudent?.first_name || ""} ${selectedStudent?.last_name || ""}`.trim() ||
                      "-"}
                  </span>
                </div>

                <div>
                  المبلغ المتبقي:{" "}
                  <span className="text-gray-800 font-medium">$100</span>
                </div>

                <div>
                  المبلغ الكلي:{" "}
                  <span className="text-gray-800 font-medium">$200</span>
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
              nextLabel={initialData ? "إرسال طلب تعديل" : "التالي"}
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
