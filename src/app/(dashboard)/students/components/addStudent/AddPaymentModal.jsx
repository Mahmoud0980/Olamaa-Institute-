"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import { useAddPaymentMutation } from "@/store/services/paymentsApi";

/* ================= constants ================= */
const CURRENCY_OPTIONS = [
  { key: "USD", value: "USD", label: "دولار (USD)" },
  { key: "SYP", value: "SYP", label: "ليرة سورية (SYP)" },
];

export default function AddPaymentModal({
  isOpen,
  onClose,
  studentId,
  instituteBranchId,
  enrollmentContractId,
  remainingAmountUsd,
}) {
  const [addPayment, { isLoading }] = useAddPaymentMutation();

  const [currency, setCurrency] = useState("USD");

  const [form, setForm] = useState({
    receipt_number: "",
    amount_usd: "",
    amount_syp: "",
    exchange_rate_at_payment: "",
    paid_date: "",
    description: "",
  });

  if (!isOpen) return null;

  /* ================= helpers ================= */
  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  /* ================= submit ================= */
  const handleSubmit = async () => {
    try {
      // ===== validations =====
      if (!form.receipt_number) {
        toast.error("رقم الإيصال مطلوب");
        return;
      }

      if (!form.paid_date) {
        toast.error("تاريخ الدفع مطلوب");
        return;
      }

      let amountUsd = 0;
      let exchangeRate = 1;

      if (currency === "USD") {
        if (!form.amount_usd || Number(form.amount_usd) <= 0) {
          toast.error("أدخل مبلغ صحيح بالدولار");
          return;
        }
        amountUsd = Number(form.amount_usd);
        exchangeRate = 1;
      } else {
        if (!form.amount_syp || Number(form.amount_syp) <= 0) {
          toast.error("أدخل مبلغ صحيح بالليرة السورية");
          return;
        }

        if (
          !form.exchange_rate_at_payment ||
          Number(form.exchange_rate_at_payment) <= 0
        ) {
          toast.error("أدخل سعر صرف صحيح");
          return;
        }

        exchangeRate = Number(form.exchange_rate_at_payment);
        amountUsd = Number(form.amount_syp) / exchangeRate;
      }

      // ===== remaining amount check =====
      if (amountUsd > remainingAmountUsd) {
        toast.error(
          `المبلغ المدفوع (${amountUsd.toFixed(
            2
          )}$) أكبر من المتبقي (${remainingAmountUsd.toFixed(2)}$)`
        );
        return;
      }

      // ===== payload =====
      const payload = {
        receipt_number: form.receipt_number,
        institute_branch_id: instituteBranchId,
        student_id: studentId,
        enrollment_contract_id: enrollmentContractId,

        currency,
        amount_usd: Number(amountUsd.toFixed(2)),
        exchange_rate_at_payment: exchangeRate,

        paid_date: form.paid_date,
        description: form.description || "دفعة نقدًا",
      };

      if (currency === "SYP") {
        payload.amount_syp = Number(form.amount_syp);
      }

      console.log("📦 PAYMENT PAYLOAD", payload);

      await addPayment(payload).unwrap();
      toast.success("تمت إضافة الدفعة بنجاح");
      onClose();
    } catch (err) {
      console.error(err?.data);
      toast.error("فشل إضافة الدفعة");
    }
  };

  /* ================= render ================= */
  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/40">
      <div className="bg-white w-[420px] h-full flex flex-col shadow-xl">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="font-semibold text-[#6F013F] text-lg">إضافة دفعة</h3>
            {/* <p className="text-xs text-gray-500 mt-0.5">
              المبلغ المتبقي على العقد:
              <span className="font-semibold text-[#6F013F] ms-1">
                {remainingAmountUsd.toFixed(2)} $
              </span>
            </p> */}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <X />
          </button>
        </div>

        {/* ===== Body ===== */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <InputField
            label="رقم الإيصال"
            value={form.receipt_number}
            onChange={(e) => handleChange("receipt_number", e.target.value)}
          />

          <SearchableSelect
            label="العملة"
            value={currency}
            onChange={setCurrency}
            options={CURRENCY_OPTIONS}
            allowClear={false}
          />

          {currency === "USD" && (
            <InputField
              label="المبلغ بالدولار"
              type="number"
              value={form.amount_usd}
              onChange={(e) => handleChange("amount_usd", e.target.value)}
            />
          )}

          {currency === "SYP" && (
            <>
              <InputField
                label="المبلغ بالليرة السورية"
                type="number"
                value={form.amount_syp}
                onChange={(e) => handleChange("amount_syp", e.target.value)}
              />

              <InputField
                label="سعر الصرف"
                type="number"
                value={form.exchange_rate_at_payment}
                onChange={(e) =>
                  handleChange("exchange_rate_at_payment", e.target.value)
                }
              />
            </>
          )}

          <InputField
            label="تاريخ الدفع"
            type="date"
            value={form.paid_date}
            onChange={(e) => handleChange("paid_date", e.target.value)}
          />

          <InputField
            label="ملاحظات"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        {/* ===== Footer ===== */}
        <div className="px-5 py-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-[#6F013F] text-white py-2.5 rounded-xl font-medium disabled:opacity-60"
          >
            حفظ الدفعة
          </button>
        </div>
      </div>
    </div>
  );
}
