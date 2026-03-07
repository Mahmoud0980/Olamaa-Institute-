"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DatePickerSmart from "@/components/common/DatePickerSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export default function PaymentInstallmentAddModal({
  open,
  title = "إضافة قسط",
  loading = false,
  onClose,
  onSubmit,
  initialData = null,
  defaultContractId = "",
}) {
  const step = 1;
  const total = 1;

  const statusOptions = useMemo(
    () => [
      { value: "pending", label: "معلّق" },
      { value: "paid", label: "مدفوع" },
      { value: "overdue", label: "متأخر" },
    ],
    [],
  );

  const emptyForm = useMemo(
    () => ({
      enrollment_contract_id: defaultContractId
        ? String(defaultContractId)
        : "",
      installment_number: "",
      due_date: "",
      planned_amount_usd: "",
      exchange_rate_at_due_date: "",
      planned_amount_syp: "",
      status: "pending",
    }),
    [defaultContractId],
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        enrollment_contract_id: String(
          initialData.enrollment_contract_id ?? defaultContractId ?? "",
        ),
        installment_number: initialData.installment_number ?? "",
        due_date: initialData.due_date ?? "",
        planned_amount_usd: initialData.planned_amount_usd ?? "",
        exchange_rate_at_due_date: initialData.exchange_rate_at_due_date ?? "",
        planned_amount_syp: initialData.planned_amount_syp ?? "",
        status: initialData.status ?? "pending",
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, initialData, emptyForm, defaultContractId]);

  const validate = () => {
    if (!form.enrollment_contract_id) return "رقم العقد مطلوب";
    if (!form.installment_number) return "رقم القسط مطلوب";
    if (!form.due_date) return "تاريخ الاستحقاق مطلوب";
    if (!form.planned_amount_usd) return "المبلغ بالدولار مطلوب";
    if (!form.status) return "الحالة مطلوبة";
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) {
      notify.error(err);
      return;
    }

    onSubmit?.({
      enrollment_contract_id: toNumOrNull(form.enrollment_contract_id),
      installment_number: toNumOrNull(form.installment_number),
      due_date: form.due_date || null,
      planned_amount_usd: toNumOrNull(form.planned_amount_usd),
      exchange_rate_at_due_date: toNumOrNull(form.exchange_rate_at_due_date),
      planned_amount_syp: toNumOrNull(form.planned_amount_syp),
      status: form.status || "pending",
    });
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
            {initialData ? "تعديل قسط" : title}
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
              label="رقم العقد"
              required
              value={form.enrollment_contract_id}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  enrollment_contract_id: e.target.value,
                }))
              }
              placeholder="70"
              disabled={!!defaultContractId}
            />

            <FormInput
              label="رقم القسط"
              required
              value={form.installment_number}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  installment_number: e.target.value,
                }))
              }
              placeholder="1"
            />

            <DatePickerSmart
              label="تاريخ الاستحقاق"
              required
              value={form.due_date}
              onChange={(iso) => setForm((p) => ({ ...p, due_date: iso }))}
              placeholder="dd/mm/yyyy"
            />

            <FormInput
              label="المبلغ المخطط بالدولار"
              required
              value={form.planned_amount_usd}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  planned_amount_usd: e.target.value,
                }))
              }
              placeholder="600"
            />

            <FormInput
              label="سعر الصرف بتاريخ الاستحقاق"
              value={form.exchange_rate_at_due_date}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  exchange_rate_at_due_date: e.target.value,
                }))
              }
              placeholder="10000"
            />

            <FormInput
              label="المبلغ المخطط بالليرة"
              value={form.planned_amount_syp}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  planned_amount_syp: e.target.value,
                }))
              }
              placeholder="6000000"
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
        </div>

        <div className="px-6 py-4 bg-white">
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!initialData}
            loading={loading}
            onNext={handleSubmit}
            onBack={onClose}
            nextLabel={initialData ? "حفظ التعديل" : "حفظ"}
          />
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
