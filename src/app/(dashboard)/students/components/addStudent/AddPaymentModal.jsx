"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import { useAddPaymentMutation } from "@/store/services/paymentsApi";

/* ================= helpers ================= */
function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

const CURRENCY_OPTIONS = [
  { value: "USD", label: "دولار (USD)" },
  { value: "SYP", label: "ليرة سورية (SYP)" },
];

export default function AddPaymentModal({
  isOpen,
  onClose,

  studentId,
  instituteBranchId,
  enrollmentContractId,
  remainingAmountUsd = 0,
}) {
  const [addPayment, { isLoading }] = useAddPaymentMutation();

  const step = 1;
  const total = 1;

  const currencyOptions = useMemo(() => CURRENCY_OPTIONS, []);

  const [form, setForm] = useState({
    receipt_number: "",
    currency: "USD",
    amount_usd: "",
    amount_syp: "",
    exchange_rate_at_payment: "",
    paid_date: "",
    description: "",
  });

  // ✅ reset on open
  useEffect(() => {
    if (!isOpen) return;
    setForm({
      receipt_number: "",
      currency: "USD",
      amount_usd: "",
      amount_syp: "",
      exchange_rate_at_payment: "",
      paid_date: "",
      description: "",
    });
  }, [isOpen]);

  const validate = () => {
    if (!studentId) return "الطالب غير محدد";
    if (!instituteBranchId) return "فرع المعهد غير محدد";
    if (!enrollmentContractId) return "رقم العقد غير محدد";

    if (!form.receipt_number) return "رقم الإيصال مطلوب";
    if (!form.paid_date) return "تاريخ الدفع مطلوب";
    if (!form.currency) return "يرجى اختيار العملة";

    if (form.currency === "USD") {
      if (!form.amount_usd || Number(form.amount_usd) <= 0)
        return "أدخل مبلغ صحيح بالدولار";
    }

    if (form.currency === "SYP") {
      if (!form.amount_syp || Number(form.amount_syp) <= 0)
        return "أدخل مبلغ صحيح بالليرة السورية";

      if (
        !form.exchange_rate_at_payment ||
        Number(form.exchange_rate_at_payment) <= 0
      )
        return "أدخل سعر صرف صحيح";
    }

    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) return toast.error(err);

    try {
      let amountUsd = 0;
      let exchangeRate = 1;

      if (form.currency === "USD") {
        amountUsd = Number(form.amount_usd);
        exchangeRate = 1;
      } else {
        exchangeRate = Number(form.exchange_rate_at_payment);
        amountUsd = Number(form.amount_syp) / exchangeRate;
      }

      // ✅ remaining amount check
      if (Number(amountUsd) > Number(remainingAmountUsd || 0)) {
        toast.error(
          `المبلغ المدفوع (${Number(amountUsd).toFixed(
            2
          )}$) أكبر من المتبقي (${Number(remainingAmountUsd || 0).toFixed(2)}$)`
        );
        return;
      }

      const payload = {
        receipt_number: form.receipt_number,
        institute_branch_id: toNumOrNull(instituteBranchId),
        student_id: toNumOrNull(studentId),
        enrollment_contract_id: toNumOrNull(enrollmentContractId),

        currency: form.currency,
        amount_usd: Number(Number(amountUsd).toFixed(2)),
        exchange_rate_at_payment: exchangeRate,

        paid_date: form.paid_date,
        description: form.description || "دفعة نقدًا",
      };

      if (form.currency === "SYP") {
        payload.amount_syp = toNumOrNull(form.amount_syp);
      }

      await addPayment(payload).unwrap();
      toast.success("تمت إضافة الدفعة بنجاح");
      onClose?.();
    } catch (e) {
      console.error(e?.data || e);
      toast.error(e?.data?.message || "فشل إضافة الدفعة");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md flex">
      <div
        dir="rtl"
        className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#6F013F] font-semibold">إضافة دفعة</h2>
            <p className="text-xs text-gray-500 mt-1">
              المتبقي على العقد:
              <span className="font-semibold text-[#6F013F] ms-1">
                {Number(remainingAmountUsd || 0).toFixed(2)} $
              </span>
            </p>
          </div>

          <button onClick={onClose} type="button">
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="رقم الإيصال"
            placeholder="REC-001"
            value={form.receipt_number}
            onChange={(e) =>
              setForm((p) => ({ ...p, receipt_number: e.target.value }))
            }
          />

          <SearchableSelect
            label="العملة"
            required
            value={form.currency}
            onChange={(v) => setForm((p) => ({ ...p, currency: v }))}
            options={currencyOptions}
            placeholder="اختر العملة..."
            allowClear={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="سعر الصرف"
              required={form.currency === "SYP" || !!form.amount_syp}
              placeholder="10000"
              value={form.exchange_rate_at_payment}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  exchange_rate_at_payment: e.target.value,
                }))
              }
              disabled={form.currency !== "SYP"}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="المبلغ بالدولار"
              required={form.currency === "USD"}
              placeholder="100"
              value={form.amount_usd}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount_usd: e.target.value }))
              }
              disabled={form.currency !== "USD"}
              type="number"
            />

            <FormInput
              label="المبلغ بالليرة"
              required={form.currency === "SYP"}
              placeholder="1000000"
              value={form.amount_syp}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount_syp: e.target.value }))
              }
              disabled={form.currency !== "SYP"}
              type="number"
            />
          </div>

          <FormInput
            label="ملاحظات"
            placeholder="دفعة نقدًا..."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />

          <StepButtonsSmart
            step={step}
            total={total}
            loading={isLoading}
            onNext={handleSubmit}
            onBack={onClose}
            nextLabel="حفظ"
          />
        </div>
      </div>

      {/* click outside */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
