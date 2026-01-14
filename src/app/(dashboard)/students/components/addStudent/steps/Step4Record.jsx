"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { Controller } from "react-hook-form";

const RECORD_TYPES = [
  { key: "ninth_grade", value: "ninth_grade", label: "ناجح تاسع" },
  { key: "bac_passed", value: "bac_passed", label: "ناجح بكالوريا" },
  { key: "bac_failed", value: "bac_failed", label: "راسب بكالوريا" },
  { key: "other", value: "other", label: "أخرى" },
];

export default function Step4Record({
  control,
  register,
  errors,
  onNext,
  onBack,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[#6F013F] font-semibold text-sm">
        السجل الأكاديمي للطالب
      </h3>

      {/* record_type (SearchableSelect) */}
      <Controller
        control={control}
        name="record_type"
        rules={{ required: "نوع السجل مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="نوع السجل الأكاديمي"
            required
            value={field.value || ""}
            onChange={field.onChange}
            options={RECORD_TYPES}
            placeholder="اختر نوع السجل"
            allowClear
          />
        )}
      />
      <p className="text-xs text-red-500">{errors.record_type?.message}</p>

      <InputField
        label="المجموع"
        type="number"
        required
        register={register("total_score", {
          required: "المجموع مطلوب",
          valueAsNumber: true,
        })}
        error={errors.total_score?.message}
      />

      {/* year (number) + منع غير أرقام */}
      <InputField
        label="السنة"
        type="number"
        required
        register={register("year", {
          required: "السنة مطلوبة",
          valueAsNumber: true,
          min: { value: 1900, message: "السنة غير صحيحة" },
          max: {
            value: new Date().getFullYear() + 1,
            message: "السنة غير صحيحة",
          },
          onChange: (e) => {
            // يمنع إدخال أحرف + يحدها 4 خانات
            e.target.value = String(e.target.value)
              .replace(/\D/g, "")
              .slice(0, 4);
          },
        })}
        error={errors.year?.message}
      />

      <textarea
        rows={3}
        {...register("description")}
        placeholder="الوصف (اختياري)"
        className="rounded-xl p-2 text-sm w-full border border-gray-200 outline-none"
      />

      <StepButtonsSmart step={4} total={6} onNext={onNext} onBack={onBack} />
    </div>
  );
}
