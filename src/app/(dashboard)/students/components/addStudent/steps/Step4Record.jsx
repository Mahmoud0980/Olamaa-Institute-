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
  onSkip,
  loading = false,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* ===== Header ثابت ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-1 pb-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[#6F013F] font-semibold text-sm">
            السجل الأكاديمي للطالب
          </h3>
          <span className="text-[11px] text-gray-400">الخطوة 4</span>
        </div>
      </div>

      {/* ===== Body (سكرول على الحقول فقط) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4">
        <div className="space-y-4">
          {/* record_type (صار اختياري) */}
          <Controller
            control={control}
            name="record_type"
            // ✅ شيلنا required
            render={({ field }) => (
              <div className="space-y-1">
                <SearchableSelect
                  label="نوع السجل الأكاديمي (اختياري)"
                  // ✅ شيلنا required من UI كمان
                  value={field.value ? String(field.value) : null}
                  onChange={(v) => {
                    const val = typeof v === "object" ? v?.value : v;
                    field.onChange(val ? String(val) : null);
                  }}
                  options={RECORD_TYPES}
                  placeholder="اختر نوع السجل"
                  allowClear
                />
                {!!errors?.record_type?.message && (
                  <p className="text-[12px] text-red-600">
                    {errors.record_type.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* total_score (اختياري) */}
          <InputField
            label="المجموع (اختياري)"
            type="number"
            register={register("total_score", {
              valueAsNumber: true,
              validate: (v) => {
                // ✅ فاضي مسموح
                if (v === null || v === undefined || v === "") return true;
                // ملاحظة: مع valueAsNumber الفاضي ممكن يصير NaN حسب الكومبوننت
                // if (Number.isNaN(Number(v))) return "المجموع غير صالح";
                return true;
              },
            })}
            error={errors?.total_score?.message}
          />

          {/* year (اختياري) */}
          <InputField
            label="السنة (اختياري)"
            type="text"
            placeholder="YYYY"
            register={register("year", {
              setValueAs: (v) =>
                String(v ?? "")
                  .replace(/\D/g, "")
                  .slice(0, 4),
              validate: (v) => {
                const yStr = String(v ?? "").replace(/\D/g, "");
                // ✅ فاضي مسموح
                if (!yStr) return true;

                const y = Number(yStr);
                const currentYear = new Date().getFullYear();

                if (yStr.length !== 4) return "أدخل السنة من 4 أرقام";
                if (y < 1900 || y > currentYear) return "السنة غير صحيحة";
                return true;
              },
            })}
            error={errors?.year?.message}
          />

          {/* description (اختياري) */}
          <div className="space-y-1">
            <label className="text-sm text-gray-700 font-medium">
              الوصف (اختياري)
            </label>
            <textarea
              rows={3}
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "الوصف لا يجب أن يتجاوز 200 محرف",
                },
                setValueAs: (v) => String(v ?? "").trim(),
              })}
              placeholder="اكتب الوصف (بحد أقصى 200 محرف)"
              className="rounded-xl p-2 text-sm w-full border border-gray-200 outline-none focus:border-[#6F013F] focus:ring-1 focus:ring-[#F4D3E3]"
            />
            {!!errors?.description?.message && (
              <p className="text-[12px] text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== Footer ثابت ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-t border-gray-100 px-1 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-gray-500 hover:text-[#6F013F] transition"
            disabled={loading}
          >
            تخطي هذه الخطوة
          </button>

          <StepButtonsSmart
            step={4}
            total={6}
            onNext={onNext}
            onBack={onBack}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
