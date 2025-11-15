"use client";

import InputField from "@/components/common/InputField";
import PhoneInput from "@/components/common/PhoneInput";

export default function Step5Contacts({
  register,
  errors,
  setValue,
  onNext,
  onBack,
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-[#6F013F] font-semibold text-sm">معلومات الاتصال</h3>

      <div className="flex flex-col">
        <label className="text-sm">نوع جهة الاتصال</label>
        <select
          defaultValue=""
          className="border rounded-xl p-2 text-sm"
          {...register("type", { required: "نوع الجهة مطلوب" })}
        >
          <option value="" disabled>
            اختر النوع
          </option>
          <option value="phone">هاتف</option>
          <option value="email">ايميل</option>
          <option value="whatsapp">واتساب</option>
        </select>
        <p className="text-xs text-red-500">{errors.type?.message}</p>
      </div>

      <InputField
        label="القيمة"
        required
        register={register("value", { required: "هذا الحقل مطلوب" })}
        error={errors.value?.message}
      />

      <PhoneInput
        name="phone_number"
        register={register}
        setValue={setValue}
        error={errors.phone_number?.message}
      />

      <InputField
        label="رمز الدولة"
        required
        register={register("country_code", {
          required: "رمز الدولة مطلوب",
        })}
        error={errors.country_code?.message}
      />

      <InputField
        label="ملاحظات"
        register={register("notes")}
        error={errors.notes?.message}
      />

      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="bg-gray-200 px-4 py-2 rounded-lg">
          السابق
        </button>

        <button
          onClick={onNext}
          className="bg-[#6F013F] text-white px-4 py-2 rounded-lg"
        >
          حفظ
        </button>
      </div>
    </div>
  );
}
