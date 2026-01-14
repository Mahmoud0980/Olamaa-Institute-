"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  usePreviewInstallmentsMutation,
  useAddEnrollmentContractMutation,
} from "@/store/services/enrollmentContractsApi";

/* ================= constants ================= */
const MODE_OPTIONS = [
  { key: "automatic", value: "automatic", label: "أوتوماتيكي" },
  { key: "manual", value: "manual", label: "يدوي" },
];

const CURRENCY_OPTIONS = [
  { key: "usd", value: "usd", label: "دولار (USD)" },
  { key: "syp", value: "syp", label: "ليرة سورية (SYP)" },
];

const DISCOUNT_OPTIONS = [
  { key: "none", value: "0", label: "بدون حسم" },
  { key: "teachers", value: "20", label: "حسم أبناء معلمين (20%)" },
  { key: "union", value: "10", label: "حسم نقابة (10%)" },
];

/* ================= component ================= */
export default function Step6EnrollmentContract({ studentId, onNext, onBack }) {
  const [currency, setCurrency] = useState("usd");
  const [mode, setMode] = useState("automatic");

  const [form, setForm] = useState(() => ({
    total_amount_usd: "",
    final_amount_syp: "", // هون عم نستخدمه كـ "المبلغ بالليرة قبل الحسم"
    exchange_rate_at_enrollment: "",

    discount_percentage: "0",

    agreed_at: new Date().toISOString().slice(0, 10),

    installments_start_date: "",
    installments_count: "",

    description: "",
  }));

  const [installments, setInstallments] = useState([]);

  const [previewInstallments, { isLoading: previewLoading }] =
    usePreviewInstallmentsMutation();

  const [addContract, { isLoading: saving }] =
    useAddEnrollmentContractMutation();

  /* ================= helpers ================= */
  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  /* ================= computed amounts ================= */
  const computed = useMemo(() => {
    const discount = Number(form.discount_percentage) || 0;

    const rate = Number(form.exchange_rate_at_enrollment) || 0;

    const totalUsd =
      currency === "usd"
        ? Number(form.total_amount_usd) || 0
        : rate > 0
        ? (Number(form.final_amount_syp) || 0) / rate
        : 0;

    const finalUsd = totalUsd - totalUsd * (discount / 100);

    const finalSyp =
      currency === "syp" && rate > 0 ? Math.round(finalUsd * rate) : 0;

    return { discount, rate, totalUsd, finalUsd, finalSyp };
  }, [
    currency,
    form.total_amount_usd,
    form.final_amount_syp,
    form.exchange_rate_at_enrollment,
    form.discount_percentage,
  ]);

  /* ================= clear auto-preview if inputs change ================= */
  useEffect(() => {
    if (mode !== "automatic") return;
    if (installments.length === 0) return;

    // أي تغيير هون بيخلي الأقساط القديمة غير صالحة
    setInstallments([]);
  }, [
    mode,
    currency,
    form.total_amount_usd,
    form.final_amount_syp,
    form.exchange_rate_at_enrollment,
    form.discount_percentage,
    form.installments_start_date,
    form.agreed_at,
  ]);

  /* ================= reset installments on mode switch ================= */
  useEffect(() => {
    setInstallments([]);
  }, [mode]);

  /* ================= build manual installments rows ================= */
  useEffect(() => {
    if (mode !== "manual") return;

    const count = Number(form.installments_count) || 0;

    if (count <= 0) {
      setInstallments([]);
      return;
    }

    setInstallments((prev) => {
      const next = Array.from({ length: count }, (_, idx) => {
        const n = idx + 1;
        const existing = prev.find((p) => Number(p.installment_number) === n);

        return {
          installment_number: n,
          due_date: existing?.due_date || "",
          planned_amount_usd: existing?.planned_amount_usd ?? "",
        };
      });

      return next;
    });
  }, [mode, form.installments_count]);

  /* ================= validation ================= */
  const validateCommon = () => {
    if (!form.agreed_at) {
      toast.error("حدد تاريخ العقد / الاتفاق");
      return false;
    }

    if (!form.installments_start_date) {
      toast.error("حدد تاريخ بدء الأقساط");
      return false;
    }

    // شرط: تاريخ بدء الأقساط >= تاريخ العقد
    if (String(form.installments_start_date) < String(form.agreed_at)) {
      toast.error("تاريخ بدء الأقساط لا يمكن أن يكون قبل تاريخ العقد");
      return false;
    }

    if (currency === "usd") {
      if (!form.total_amount_usd || Number(form.total_amount_usd) <= 0) {
        toast.error("أدخل المبلغ بالدولار");
        return false;
      }
    } else {
      if (!form.final_amount_syp || Number(form.final_amount_syp) <= 0) {
        toast.error("أدخل المبلغ بالليرة السورية");
        return false;
      }
      if (
        !form.exchange_rate_at_enrollment ||
        Number(form.exchange_rate_at_enrollment) <= 0
      ) {
        toast.error("أدخل سعر الصرف");
        return false;
      }
    }

    return true;
  };

  const validateManualInstallments = () => {
    const count = Number(form.installments_count) || 0;

    if (count <= 0) {
      toast.error("أدخل عدد الأقساط");
      return false;
    }

    if (installments.length !== count) {
      toast.error("عدد الأقساط لا يطابق عدد الحقول");
      return false;
    }

    let sum = 0;

    for (const inst of installments) {
      if (!inst.due_date) {
        toast.error(`حدد تاريخ القسط رقم ${inst.installment_number}`);
        return false;
      }

      const amount = Number(inst.planned_amount_usd);

      if (!amount || amount <= 0) {
        toast.error(`أدخل قيمة صحيحة للقسط رقم ${inst.installment_number}`);
        return false;
      }

      sum += amount;
    }

    // ✅ الفحص الأساسي
    const finalUsd = Number(computed.finalUsd.toFixed(2));
    const sumRounded = Number(sum.toFixed(2));

    if (sumRounded < finalUsd) {
      toast.error(
        `مجموع الأقساط (${sumRounded}$) أقل من المبلغ النهائي (${finalUsd}$)`
      );
      return false;
    }

    if (sumRounded > finalUsd) {
      toast.error(
        `مجموع الأقساط (${sumRounded}$) أكبر من المبلغ النهائي (${finalUsd}$)`
      );
      return false;
    }

    return true;
  };

  /* ================= payload builder ================= */
  const buildPayload = () => {
    const total_amount_usd = Number.isFinite(computed.totalUsd)
      ? Number(computed.totalUsd.toFixed(2))
      : 0;

    const final_amount_usd = Number.isFinite(computed.finalUsd)
      ? Number(computed.finalUsd.toFixed(2))
      : 0;

    const payload = {
      student_id: studentId,

      total_amount_usd,
      discount_percentage: computed.discount,

      final_amount_usd,
      final_amount_syp: currency === "syp" ? computed.finalSyp : 0,
      exchange_rate_at_enrollment: currency === "syp" ? computed.rate : 0,

      agreed_at: form.agreed_at,
      description: form.description,
      is_active: true,

      mode,
      installments_start_date: form.installments_start_date,
    };

    if (mode === "manual") {
      payload.installments_count = Number(form.installments_count) || 0;
    }

    return payload;
  };

  /* ================= preview (automatic) ================= */
  const handlePreview = async () => {
    if (!validateCommon()) return;

    const payload = buildPayload();

    console.group("📦 Preview Payload (API)");
    console.log(payload);
    console.groupEnd();

    try {
      const res = await previewInstallments(payload).unwrap();
      setInstallments(res.installments || []);
      toast.success("تمت معاينة الأقساط");
    } catch (err) {
      console.error("❌ Preview Error:", err?.data);
      toast.error("فشل في معاينة الأقساط");
    }
  };

  /* ================= submit ================= */
  const handleSubmit = async () => {
    if (!validateCommon()) return;

    if (mode === "automatic" && installments.length === 0) {
      toast.error("يجب معاينة الأقساط قبل الحفظ");
      return;
    }

    if (mode === "manual" && !validateManualInstallments()) {
      return;
    }

    const normalizedInstallments =
      mode === "manual"
        ? installments.map((i) => ({
            installment_number: Number(i.installment_number),
            due_date: i.due_date,
            planned_amount_usd: Number(i.planned_amount_usd),
          }))
        : installments;

    const payload = {
      ...buildPayload(),
      installments: normalizedInstallments,
    };

    console.log("📦 FINAL SAVE PAYLOAD", payload);

    try {
      await addContract(payload).unwrap();
      toast.success("تم حفظ عقد التسجيل");
      onNext();
    } catch (err) {
      console.error(err?.data);
      toast.error("فشل حفظ العقد");
    }
  };

  /* ================= manual row change ================= */
  const handleInstallmentChange = (installment_number, field, value) => {
    setInstallments((prev) =>
      prev.map((inst) =>
        Number(inst.installment_number) === Number(installment_number)
          ? { ...inst, [field]: value }
          : inst
      )
    );
  };

  /* ================= render ================= */
  return (
    <div className="space-y-4">
      <h3 className="text-[#6F013F] font-semibold">عقد التسجيل والأقساط</h3>

      <SearchableSelect
        label="العملة"
        value={currency}
        onChange={setCurrency}
        options={CURRENCY_OPTIONS}
        allowClear={false}
      />

      {/* ✅ الحسم بعد العملة */}
      <SearchableSelect
        label="الحسم"
        value={String(form.discount_percentage || "0")}
        onChange={(val) => handleChange("discount_percentage", val)}
        options={DISCOUNT_OPTIONS}
        allowClear={false}
      />

      {/* ✅ agreed_at */}
      <InputField
        label="تاريخ العقد / الاتفاق"
        type="date"
        value={form.agreed_at}
        onChange={(e) => handleChange("agreed_at", e.target.value)}
      />

      {currency === "usd" && (
        <InputField
          label="المبلغ بالدولار"
          type="number"
          value={form.total_amount_usd}
          onChange={(e) => handleChange("total_amount_usd", e.target.value)}
        />
      )}

      {currency === "syp" && (
        <>
          <InputField
            label="المبلغ بالليرة السورية (قبل الحسم)"
            type="number"
            value={form.final_amount_syp}
            onChange={(e) => handleChange("final_amount_syp", e.target.value)}
          />
          <InputField
            label="سعر الصرف"
            type="number"
            value={form.exchange_rate_at_enrollment}
            onChange={(e) =>
              handleChange("exchange_rate_at_enrollment", e.target.value)
            }
          />
        </>
      )}

      {/* ✅ عرض سريع للمبلغ بعد الحسم (اختياري) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-gray-700">
        <div>
          المبلغ بعد الحسم: {Number(computed.finalUsd || 0).toFixed(2)} USD
        </div>
        {currency === "syp" && computed.rate > 0 && (
          <div>يعادل تقريباً: {computed.finalSyp || 0} SYP</div>
        )}
      </div>

      <SearchableSelect
        label="طريقة الأقساط"
        value={mode}
        onChange={setMode}
        options={MODE_OPTIONS}
        allowClear={false}
      />

      <InputField
        label="تاريخ بدء الأقساط"
        type="date"
        value={form.installments_start_date}
        onChange={(e) =>
          handleChange("installments_start_date", e.target.value)
        }
      />

      {mode === "manual" && (
        <InputField
          label="عدد الأقساط"
          type="number"
          value={form.installments_count}
          onChange={(e) => handleChange("installments_count", e.target.value)}
        />
      )}

      {mode === "automatic" && (
        <button
          type="button"
          onClick={handlePreview}
          className="w-full bg-gray-100 rounded-lg py-2"
        >
          معاينة الأقساط
        </button>
      )}

      {/* ================= installments UI ================= */}
      {mode === "automatic" &&
        installments.map((i) => (
          <div key={i.installment_number}>
            #{i.installment_number} — {i.due_date} — {i.planned_amount_usd}$
          </div>
        ))}

      {mode === "manual" && installments.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 px-1">
            <div>رقم الدفعة</div>
            <div>تاريخ الاستحقاق</div>
            <div>الدفعة (USD)</div>
          </div>

          {installments.map((inst) => (
            <div
              key={inst.installment_number}
              className="grid grid-cols-3 gap-2 items-center"
            >
              <div className="text-sm text-gray-700">
                #{inst.installment_number}
              </div>

              <input
                type="date"
                value={inst.due_date || ""}
                onChange={(e) =>
                  handleInstallmentChange(
                    inst.installment_number,
                    "due_date",
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#D40078] focus:ring-1 focus:ring-[#F3C3D9]"
              />

              <input
                type="number"
                value={inst.planned_amount_usd ?? ""}
                onChange={(e) =>
                  handleInstallmentChange(
                    inst.installment_number,
                    "planned_amount_usd",
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#D40078] focus:ring-1 focus:ring-[#F3C3D9]"
              />
            </div>
          ))}
        </div>
      )}

      <StepButtonsSmart
        step={6}
        total={7}
        onBack={onBack}
        onNext={handleSubmit}
        loading={saving || previewLoading}
      />
    </div>
  );
}
