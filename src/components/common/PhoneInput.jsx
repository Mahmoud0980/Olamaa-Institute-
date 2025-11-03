"use client";
import { useState, useMemo } from "react";
import { phoneLengths } from "../lib/phoneLengths";
import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

export default function PhoneInput({ value, onChange, register, error, name }) {
  const [selectedCountry, setSelectedCountry] = useState("SY");
  const [phoneValue, setPhoneValue] = useState(value || "");

  const maxLen = phoneLengths[selectedCountry] || 20;

  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > maxLen) val = val.slice(0, maxLen);
    setPhoneValue(val);

    // أرسل القيمة مباشرة للأب
    onChange && onChange(val, selectedCountry);
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
    <div>
      <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
      <div className="flex">
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setPhoneValue("");
            onChange && onChange("", e.target.value);
          }}
          className="border rounded-l-md p-2 bg-gray-100"
        >
          {options.map(({ iso, calling }) => (
            <option key={iso} value={iso}>
              {iso} {calling}
            </option>
          ))}
        </select>

        <input
          type="tel"
          placeholder={`أدخل رقم الهاتف (حتى ${maxLen} أرقام)`}
          {...register(name)}
          value={phoneValue}
          onChange={handleChange}
          className="flex-1 border rounded-r-md p-2"
          maxLength={maxLen}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
