"use client";
import { useState, useMemo } from "react";
import { PhoneNumberUtil } from "google-libphonenumber";
import { phoneLengths } from "@/lib/helpers/phoneLengths";

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * مكون رقم الهاتف — متكامل مع RHF بدون Zod
 * -----------------------------------------
 * Props:
 * - name: اسم الحقل (مثلاً: "father_phone")
 * - register: من useForm
 * - setValue: لتحديث قيمة الحقل داخل RHF
 * - error: رسالة الخطأ إن وجدت
 * - defaultCountry: رمز الدولة الافتراضي (SY مثلاً)
 */
export default function PhoneInput({
  name,
  register,
  setValue,
  error,
  defaultCountry = "SY",
}) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneValue, setPhoneValue] = useState("");

  const maxLen = phoneLengths[selectedCountry] || 20;

  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > maxLen) val = val.slice(0, maxLen);
    setPhoneValue(val);
    setValue(name, val);
  };

  const options = useMemo(() => {
    return Object.keys(phoneLengths).map((iso) => {
      let calling = "";
      try {
        const num = phoneUtil.getCountryCodeForRegion(iso);
        calling = num ? `+${num}` : "";
      } catch {
        calling = "";
      }
      return { iso, calling };
    });
  }, []);

  return (
    <div className="flex flex-col gap-1 text-right">
      <label className="text-sm text-gray-700 font-medium">رقم الهاتف</label>

      <div className="flex" dir="rtl">
        {/* اختيار الدولة */}
        <select
          value={selectedCountry}
          onChange={(e) => {
            const newCountry = e.target.value;
            setSelectedCountry(newCountry);
            setPhoneValue("");
            setValue(name, ""); // إعادة ضبط رقم الهاتف
          }}
          className="border border-gray-200 rounded-r-lg p-2 bg-gray-50 text-sm focus:ring-1 focus:ring-pink-200 focus:border-pink-400 outline-none"
        >
          {options.map(({ iso, calling }) => (
            <option key={iso} value={iso}>
              {iso} {calling}
            </option>
          ))}
        </select>

        {/* إدخال الرقم */}
        <input
          type="tel"
          placeholder={`أدخل رقم الهاتف (حتى ${maxLen} أرقام)`}
          {...register(name, {
            required: "رقم الهاتف مطلوب",
            minLength: {
              value: 5,
              message: "الرقم قصير جدًا",
            },
          })}
          value={phoneValue}
          onChange={handleChange}
          maxLength={maxLen}
          className="flex-1 border border-gray-200 rounded-l-lg p-2 text-sm focus:ring-1 focus:ring-pink-200 focus:border-pink-400 outline-none text-right"
        />
      </div>

      {/* رسالة الخطأ */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
