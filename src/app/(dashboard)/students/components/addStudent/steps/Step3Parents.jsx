"use client";

import InputField from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import PhoneInput from "@/components/common/PhoneInput";

const clean = (v) =>
  String(v ?? "")
    .trim()
    .replace(/\s+/g, " ");

export default function Step3Parents({
  register,
  errors,
  setValue,
  watch,
  onNext,
  onBack,
}) {
  const fatherPhone = watch("father_phone") || "";
  const motherPhone = watch("mother_phone") || "";

  return (
    <div className="space-y-6">
      {/* hidden registrations */}
      <input type="hidden" {...register("father_phone")} />
      <input type="hidden" {...register("mother_phone")} />

      {/* الأب */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <h2 className="text-[#6F013F] font-semibold text-sm">معلومات الأب</h2>

        <InputField
          label="اسم الأب"
          required
          register={register("father_first_name", {
            required: "اسم الأب مطلوب",
            setValueAs: (v) => clean(v),
          })}
          error={errors.father_first_name?.message}
        />

        <InputField
          label="كنية الأب"
          required
          register={register("father_last_name", {
            required: "كنية الأب مطلوبة",
            setValueAs: (v) => clean(v),
          })}
          error={errors.father_last_name?.message}
        />

        <InputField
          label="الرقم الوطني للأب"
          type="text"
          placeholder="10 أرقام فقط"
          register={register("father_national_id", {
            setValueAs: (v) => clean(v),
            validate: (v) => {
              if (!v) return true; // مو إجباري
              return /^[0-9]{10}$/.test(v) || "يجب إدخال 10 أرقام فقط";
            },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
            },
          })}
        />
        <p className="text-xs text-red-500">
          {errors.father_national_id?.message}
        </p>

        <PhoneInput
          name="father_phone"
          value={fatherPhone}
          setValue={setValue}
          error={errors.father_phone?.message}
        />

        <InputField
          label="مهنة الأب"
          register={register("father_occupation", {
            setValueAs: (v) => clean(v),
          })}
        />
        <InputField
          label="عنوان الأب"
          register={register("father_address", {
            setValueAs: (v) => clean(v),
          })}
        />
      </div>

      {/* الأم */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <h2 className="text-[#6F013F] font-semibold text-sm">معلومات الأم</h2>

        <InputField
          label="اسم الأم"
          required
          register={register("mother_first_name", {
            required: "اسم الأم مطلوب",
            setValueAs: (v) => clean(v),
          })}
          error={errors.mother_first_name?.message}
        />

        <InputField
          label="كنية الأم"
          required
          register={register("mother_last_name", {
            required: "كنية الأم مطلوبة",
            setValueAs: (v) => clean(v),
          })}
          error={errors.mother_last_name?.message}
        />

        <InputField
          label="الرقم الوطني للأم"
          type="text"
          placeholder="10 أرقام فقط"
          register={register("mother_national_id", {
            setValueAs: (v) => clean(v),
            validate: (v) => {
              if (!v) return true; // مو إجباري
              return /^[0-9]{10}$/.test(v) || "يجب إدخال 10 أرقام فقط";
            },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
            },
          })}
        />
        <p className="text-xs text-red-500">
          {errors.mother_national_id?.message}
        </p>

        <PhoneInput
          name="mother_phone"
          value={motherPhone}
          setValue={setValue}
          error={errors.mother_phone?.message}
        />

        <InputField
          label="مهنة الأم"
          register={register("mother_occupation", {
            setValueAs: (v) => clean(v),
          })}
        />
        <InputField
          label="عنوان الأم"
          register={register("mother_address", {
            setValueAs: (v) => clean(v),
          })}
        />
      </div>

      <StepButtonsSmart step={3} total={6} onNext={onNext} onBack={onBack} />
    </div>
  );
}
