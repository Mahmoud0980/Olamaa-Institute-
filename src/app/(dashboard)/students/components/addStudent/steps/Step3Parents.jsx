"use client";

import InputField from "@/components/common/InputField";
import PhoneInput from "@/components/common/PhoneInput";

export default function Step3Parents({
  register,
  errors,
  setValue,
  onNext,
  onBack,
}) {
  return (
    <div className="space-y-6">
      {/* =============================== */}
      {/*        معلومات الأب            */}
      {/* =============================== */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <h2 className="text-[#6F013F] font-semibold text-sm mb-1">
          معلومات الأب
        </h2>

        {/* اسم الأب */}
        <InputField
          label="اسم الأب"
          required
          placeholder="أدخل اسم الأب"
          register={register("father_first_name", {
            required: "الاسم الأول للأب مطلوب",
            minLength: { value: 2, message: "الاسم قصير جدًا" },
          })}
          error={errors.father_first_name?.message}
        />

        {/* كنية الأب */}
        <InputField
          label="كنية الأب"
          required
          placeholder="أدخل كنية الأب"
          register={register("father_last_name", {
            required: "الكنية للأب مطلوبة",
            minLength: { value: 2, message: "الكنية قصيرة جدًا" },
          })}
          error={errors.father_last_name?.message}
        />

        {/* الرقم الوطني للأب */}
        <InputField
          label="الرقم الوطني للأب"
          type="number"
          placeholder="10 أرقام فقط"
          register={register("father_national_id", {
            minLength: { value: 10, message: "10 أرقام فقط" },
            maxLength: { value: 10, message: "10 أرقام فقط" },
          })}
          error={errors.father_national_id?.message}
        />

        {/* هاتف الأب */}
        <PhoneInput
          name="father_phone"
          register={register}
          setValue={setValue}
          error={errors.father_phone?.message}
        />

        {/* مهنة الأب */}
        <InputField
          label="مهنة الأب"
          placeholder="مثلاً: موظف"
          register={register("father_occupation")}
          error={errors.father_occupation?.message}
        />

        {/* عنوان الأب */}
        <InputField
          label="عنوان الأب"
          placeholder="مثلاً: دمشق - المزة"
          register={register("father_address")}
          error={errors.father_address?.message}
        />
      </div>

      {/* =============================== */}
      {/*        معلومات الأم            */}
      {/* =============================== */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <h2 className="text-[#6F013F] font-semibold text-sm mb-1">
          معلومات الأم
        </h2>

        {/* اسم الأم */}
        <InputField
          label="اسم الأم"
          required
          placeholder="أدخل اسم الأم"
          register={register("mother_first_name", {
            required: "الاسم الأول للأم مطلوب",
            minLength: { value: 2, message: "الاسم قصير جدًا" },
          })}
          error={errors.mother_first_name?.message}
        />

        {/* كنية الأم */}
        <InputField
          label="كنية الأم"
          required
          placeholder="أدخل كنية الأم"
          register={register("mother_last_name", {
            required: "الكنية للأم مطلوبة",
            minLength: { value: 2, message: "الكنية قصيرة جدًا" },
          })}
          error={errors.mother_last_name?.message}
        />

        {/* الرقم الوطني للأم */}
        <InputField
          label="الرقم الوطني للأم"
          type="number"
          placeholder="10 أرقام فقط"
          register={register("mother_national_id", {
            minLength: { value: 10, message: "10 أرقام فقط" },
            maxLength: { value: 10, message: "10 أرقام فقط" },
          })}
          error={errors.mother_national_id?.message}
        />

        {/* هاتف الأم */}
        <PhoneInput
          name="mother_phone"
          register={register}
          setValue={setValue}
          error={errors.mother_phone?.message}
        />

        {/* مهنة الأم */}
        <InputField
          label="مهنة الأم"
          placeholder="مثلاً: ربة منزل"
          register={register("mother_occupation")}
          error={errors.mother_occupation?.message}
        />

        {/* عنوان الأم */}
        <InputField
          label="عنوان الأم"
          placeholder="مثلاً: دمشق - المزة"
          register={register("mother_address")}
          error={errors.mother_address?.message}
        />
      </div>

      {/* =============================== */}
      {/*       أزرار التنقل              */}
      {/* =============================== */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
        >
          السابق
        </button>

        <button
          type="button"
          onClick={onNext}
          className="bg-[#6F013F] text-white px-4 py-2 rounded-lg"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
