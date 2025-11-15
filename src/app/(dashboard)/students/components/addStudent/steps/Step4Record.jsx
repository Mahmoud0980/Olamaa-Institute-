"use client";

import InputField from "@/components/common/InputField";

export default function Step4Record({ register, errors, onNext, onBack }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[#6F013F] font-semibold text-sm">
        السجل الأكاديمي للطالب
      </h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          نوع السجل الأكاديمي
        </label>

        <select
          {...register("record_type", { required: "نوع السجل مطلوب" })}
          className="border border-gray-200 rounded-xl py-2.5 px-3 text-sm outline-none"
          defaultValue=""
        >
          <option value="">اختر نوع السجل</option>
          <option value="ninth_grade">ناجح تاسع</option>
          <option value="bac_passed">ناجح بكالوريا</option>
          <option value="bac_failed">راسب بكالوريا</option>
          <option value="other">أخرى</option>
        </select>

        <p className="text-xs text-red-500">{errors.record_type?.message}</p>
      </div>

      <InputField
        label="المجموع"
        type="number"
        required
        register={register("total_score", {
          required: "المجموع مطلوب",
        })}
        error={errors.total_score?.message}
      />

      <InputField
        label="السنة"
        type="number"
        required
        register={register("year", {
          required: "السنة مطلوبة",
        })}
        error={errors.year?.message}
      />

      <textarea
        rows={3}
        {...register("description")}
        placeholder="الوصف (اختياري)"
        className="border rounded-xl p-2 text-sm w-full"
      />

      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="bg-gray-200 px-4 py-2 rounded-lg">
          السابق
        </button>
        <button
          onClick={onNext}
          className="bg-[#6F013F] text-white px-4 py-2 rounded-lg"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
