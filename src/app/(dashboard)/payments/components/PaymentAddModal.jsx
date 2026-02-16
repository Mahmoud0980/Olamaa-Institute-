"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
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
  const step = 1;
  const total = 1;

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
    []
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
    [defaultInstituteBranchId]
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

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
  }, [open, initialData, emptyForm]);

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
            `طالب #${s.id}`
        ).trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [filteredStudents]);

  useEffect(() => {
    if (!open) return;
    if (!form.student_id) return;

    const bid = String(form.institute_branch_id || "");
    if (!bid) {
      setForm((p) => ({ ...p, student_id: "" }));
      return;
    }

    const current = safeStudents.find(
      (s) => String(s?.id) === String(form.student_id)
    );
    if (!current) {
      setForm((p) => ({ ...p, student_id: "" }));
      return;
    }

    const currentBid = String(
      current?.institute_branch_id ?? current?.institute_branch?.id ?? ""
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

  const validate = () => {
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

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      notify.error(err, "خطأ");
      return;
    }

    const isUSD = form.currency === "USD";

    const payload = {
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

    onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start backdrop-blur-md">
      <div
        dir="rtl"
        className="w-full sm:w-[520px] bg-white h-full shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4">
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

            <FormInput
              label="تاريخ الدفع"
              required
              type="date"
              value={form.paid_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, paid_date: e.target.value }))
              }
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
        </div>

        <div className="px-6 py-4 bg-white">
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!initialData}
            loading={loading}
            onNext={handleSubmit}
            onBack={onClose}
            nextLabel={initialData ? "إرسال طلب تعديل" : "حفظ"}
          />
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
