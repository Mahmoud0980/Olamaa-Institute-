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
  errors,
  setValue,
  watch,
  onNext,
  onBack,
  loading = false,
}) {
  const fatherPhone = watch("father_phone") || "";
  const motherPhone = watch("mother_phone") || "";

  return (
    <div className="flex flex-col h-full">
      {/* ===== Header ثابت (اختياري) ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-1 pb-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[#6F013F] font-semibold text-sm">
            بيانات العائلة
          </h3>
          {/* <span className="text-[11px] text-gray-400">الخطوة 3</span> */}
        </div>
      </div>

      {/* ===== Body (سكرول على الحقول فقط) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4">
        <div className="space-y-6">
          {/* hidden registrations */}
          {/* <input
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
          /> */}

          {/* الأب */}
          <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-white">
            <h2 className="text-[#6F013F] font-semibold text-sm">
              معلومات الأب
            </h2>

            <InputField
              label="اسم الأب"
              required
              register={register("father_first_name", {
                required: "اسم الأب مطلوب",
                setValueAs: (v) => clean(v),
                minLength: {
                  value: 2,
                  message: "اسم الأب لا يجب أن يقل عن حرفين",
                },
                maxLength: {
                  value: 50,
                  message: "اسم الأب لا يجب أن يتجاوز 50 محرف",
                },
                validate: reqTrim("اسم الأب مطلوب"),
              })}
              error={errors?.father_first_name?.message}
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
              error={errors?.father_last_name?.message}
            />

            <InputField
              label="الرقم الوطني للأب (اختياري)"
              type="text"
              placeholder="10 أرقام فقط"
              register={register("father_national_id", {
                setValueAs: (v) => clean(v),
                validate: (v) => {
                  const digits = String(v ?? "").replace(/\D/g, "");
                  if (digits.length === 0) return true;
                  return digits.length === 10 || "يجب إدخال 10 أرقام فقط";
                },
                onChange: (e) => {
                  e.target.value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                },
              })}
              error={errors?.father_national_id?.message}
            />

            {/* إذا بدك ترجع PhoneInput فعّل هاد */}

            <InputField
              label="مهنة الأب"
              register={register("father_occupation", {
                setValueAs: (v) => clean(v),
                maxLength: {
                  value: 200,
                  message: "مهنة الأب لا يجب أن تتجاوز 200 محرف",
                },
              })}
              error={errors?.father_occupation?.message}
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
              error={errors?.father_address?.message}
            />
          </div>

          {/* الأم */}
          <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-white">
            <h2 className="text-[#6F013F] font-semibold text-sm">
              معلومات الأم
            </h2>

            <InputField
              label="اسم الأم"
              required
              register={register("mother_first_name", {
                required: "اسم الأم مطلوب",
                setValueAs: (v) => clean(v),
                minLength: {
                  value: 2,
                  message: "اسم الأم لا يجب أن يقل عن حرفين",
                },
                maxLength: {
                  value: 50,
                  message: "اسم الأم لا يجب أن يتجاوز 50 محرف",
                },
                validate: reqTrim("اسم الأم مطلوب"),
              })}
              error={errors?.mother_first_name?.message}
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
              error={errors?.mother_last_name?.message}
            />

            <InputField
              label="الرقم الوطني للأم (اختياري)"
              type="text"
              placeholder="10 أرقام فقط"
              register={register("mother_national_id", {
                setValueAs: (v) => clean(v),
                validate: (v) => {
                  const digits = String(v ?? "").replace(/\D/g, "");
                  if (digits.length === 0) return true;
                  return digits.length === 10 || "يجب إدخال 10 أرقام فقط";
                },
                onChange: (e) => {
                  e.target.value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                },
              })}
              error={errors?.mother_national_id?.message}
            />

            {/* <PhoneInput
              name="mother_phone"
              value={motherPhone}
              setValue={setValue}
              error={errors?.mother_phone?.message}
            /> */}

            <InputField
              label="مهنة الأم"
              register={register("mother_occupation", {
                setValueAs: (v) => clean(v),
                maxLength: {
                  value: 200,
                  message: "مهنة الأم لا يجب أن تتجاوز 200 محرف",
                },
              })}
              error={errors?.mother_occupation?.message}
            />

            <InputField
              label="عنوان الأم"
              register={register("mother_address", {
                setValueAs: (v) => clean(v),
                maxLength: {
                  value: 200,
                  message: "عنوان الأم لا يجب أن تتجاوز 200 محرف",
                },
              })}
              error={errors?.mother_address?.message}
            />
          </div>
        </div>
      </div>

      {/* ===== Footer ثابت ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-t border-gray-100 px-1 pt-3 pb-2">
        <StepButtonsSmart
          step={3}
          total={6}
          onNext={onNext}
          onBack={onBack}
          loading={loading}
        />
      </div>
    </div>
  );
}
