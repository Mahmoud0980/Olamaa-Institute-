"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { Controller } from "react-hook-form";

const RECORD_TYPES = [
  { value: "ninth_grade", label: "ناجح تاسع" },
  { value: "bac_passed", label: "ناجح بكالوريا" },
  { value: "bac_failed", label: "راسب بكالوريا" },
];

export default function Step4Record({
  control,
  register,
  errors,
  onNext,
  onBack,
  loading = false,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[#6F013F] font-semibold text-sm">
        السجل الأكاديمي للطالب
      </h3>

      {/* record_type */}
      <Controller
        control={control}
        name="record_type"
        rules={{ required: "نوع السجل مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="نوع السجل الأكاديمي"
            required
            value={field.value ? String(field.value) : ""}
            onChange={(v) => {
              const val = typeof v === "object" ? v?.value : v;
              field.onChange(val ? String(val) : "");
            }}
            options={RECORD_TYPES}
            placeholder="اختر نوع السجل"
            allowClear
          />
        )}
      />

      {/* total_score */}
      <InputField
        label="المجموع"
        type="number"
        required
        register={register("total_score", {
          required: "المجموع مطلوب",
          valueAsNumber: true,
          validate: (v) => {
            if (v === null || v === undefined || v === "")
              return "المجموع مطلوب";
            if (Number.isNaN(Number(v))) return "المجموع غير صالح";
            return true;
          },
        })}
      />

      {/* year (YYYY فقط) */}
      <InputField
        label="السنة"
        type="text"
        required
        placeholder="YYYY"
        register={register("year", {
          required: "السنة مطلوبة",
          setValueAs: (v) =>
            String(v ?? "")
              .replace(/\D/g, "")
              .slice(0, 4),
          validate: (v) => {
            const y = Number(String(v ?? "").replace(/\D/g, ""));
            const currentYear = new Date().getFullYear();
            if (!y) return "السنة مطلوبة";
            if (String(y).length !== 4) return "أدخل السنة من 4 أرقام";
            if (y < 1900 || y > currentYear) return "السنة غير صحيحة";
            return true;
          },
        })}
      />

      {/* description */}
      <textarea
        rows={3}
        {...register("description", {
          maxLength: { value: 200, message: "الوصف لا يجب أن يتجاوز 200 محرف" },
          setValueAs: (v) => String(v ?? "").trim(),
          validate: (v) =>
            String(v ?? "").trim().length ? true : "الوصف مطلوب",
        })}
        placeholder="اكتب الوصف (مطلوب) - بحد أقصى 200 محرف"
        className="rounded-xl p-2 text-sm w-full border border-gray-200 outline-none"
      />

      <StepButtonsSmart
        step={4}
        total={6}
        onNext={onNext}
        onBack={onBack}
        loading={loading}
      />
    </div>
  );
}
