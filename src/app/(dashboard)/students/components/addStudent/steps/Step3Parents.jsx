"use client";

import InputField from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import PhoneInput from "@/components/common/PhoneInput";

const clean = (v) =>
  String(v ?? "")
    .trim()
    .replace(/\s+/g, " ");

const reqTrim = (msg) => (v) => {
  const s = clean(v);
  return s.length > 0 || msg;
};

export default function Step3Parents({
  register,
  errors, // موجود للأب (toast) بس ما منعرضه هون
  setValue,
  watch,
  onNext,
  onBack,
  loading = false,
}) {
  const fatherPhone = watch("father_phone") || "";
  const motherPhone = watch("mother_phone") || "";

  return (
    <div className="space-y-6">
      {/* hidden registrations */}
      <input
        type="hidden"
        {...register("father_phone", {
          validate: reqTrim("رقم هاتف الأب مطلوب"),
          setValueAs: (v) => clean(v),
        })}
      />
      <input
        type="hidden"
        {...register("mother_phone", {
          validate: reqTrim("رقم هاتف الأم مطلوب"),
          setValueAs: (v) => clean(v),
        })}
      />

      {/* الأب */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <h2 className="text-[#6F013F] font-semibold text-sm">معلومات الأب</h2>

        <InputField
          label="اسم الأب"
          required
          register={register("father_first_name", {
            required: "اسم الأب مطلوب",
            setValueAs: (v) => clean(v),
            minLength: { value: 2, message: "اسم الأب لا يجب أن يقل عن حرفين" },
            maxLength: {
              value: 50,
              message: "اسم الأب لا يجب أن يتجاوز 50 محرف",
            },
            validate: reqTrim("اسم الأب مطلوب"),
          })}
        />

        <InputField
          label="كنية الأب"
          required
          register={register("father_last_name", {
            required: "كنية الأب مطلوبة",
            setValueAs: (v) => clean(v),
            minLength: {
              value: 2,
              message: "كنية الأب لا يجب أن تقل عن حرفين",
            },
            maxLength: {
              value: 50,
              message: "كنية الأب لا يجب أن تتجاوز 50 محرف",
            },
            validate: reqTrim("كنية الأب مطلوبة"),
          })}
        />

        <InputField
          label="الرقم الوطني للأب"
          type="text"
          placeholder="10 أرقام فقط"
          register={register("father_national_id", {
            setValueAs: (v) => clean(v),
            validate: (v) => {
              const s = clean(v);
              if (!s) return true; // اختياري
              return /^[0-9]{10}$/.test(s) || "يجب إدخال 10 أرقام فقط";
            },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
            },
          })}
        />

        <PhoneInput
          name="father_phone"
          value={fatherPhone}
          setValue={setValue}
          error={undefined}
        />

        <InputField
          label="مهنة الأب"
          register={register("father_occupation", {
            setValueAs: (v) => clean(v),
            maxLength: {
              value: 200,
              message: "مهنة الأب لا يجب أن تتجاوز 200 محرف",
            },
          })}
        />

        <InputField
          label="عنوان الأب"
          register={register("father_address", {
            setValueAs: (v) => clean(v),
            maxLength: {
              value: 200,
              message: "عنوان الأب لا يجب أن يتجاوز 200 محرف",
            },
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
            minLength: { value: 2, message: "اسم الأم لا يجب أن يقل عن حرفين" },
            maxLength: {
              value: 50,
              message: "اسم الأم لا يجب أن يتجاوز 50 محرف",
            },
            validate: reqTrim("اسم الأم مطلوب"),
          })}
        />

        <InputField
          label="كنية الأم"
          required
          register={register("mother_last_name", {
            required: "كنية الأم مطلوبة",
            setValueAs: (v) => clean(v),
            minLength: {
              value: 2,
              message: "كنية الأم لا يجب أن تقل عن حرفين",
            },
            maxLength: {
              value: 50,
              message: "كنية الأم لا يجب أن تتجاوز 50 محرف",
            },
            validate: reqTrim("كنية الأم مطلوبة"),
          })}
        />

        <InputField
          label="الرقم الوطني للأم"
          type="text"
          placeholder="10 أرقام فقط"
          register={register("mother_national_id", {
            setValueAs: (v) => clean(v),
            validate: (v) => {
              const s = clean(v);
              if (!s) return true; // اختياري
              return /^[0-9]{10}$/.test(s) || "يجب إدخال 10 أرقام فقط";
            },
            onChange: (e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
            },
          })}
        />

        <PhoneInput
          name="mother_phone"
          value={motherPhone}
          setValue={setValue}
          error={undefined}
        />

        <InputField
          label="مهنة الأم"
          register={register("mother_occupation", {
            setValueAs: (v) => clean(v),
            maxLength: {
              value: 200,
              message: "مهنة الأم لا يجب أن تتجاوز 200 محرف",
            },
          })}
        />

        <InputField
          label="عنوان الأم"
          register={register("mother_address", {
            setValueAs: (v) => clean(v),
            maxLength: {
              value: 200,
              message: "عنوان الأم لا يجب أن يتجاوز 200 محرف",
            },
          })}
        />
      </div>

      <StepButtonsSmart
        step={3}
        total={6}
        onNext={onNext}
        onBack={onBack}
        loading={loading}
      />
    </div>
  );
}
