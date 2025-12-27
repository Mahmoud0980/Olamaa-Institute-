"use client";
import { useState, useMemo } from "react";
import { PhoneNumberUtil } from "google-libphonenumber";
import { phoneLengths } from "@/lib/helpers/phoneLengths";

const phoneUtil = PhoneNumberUtil.getInstance();

export default function PhoneInputSimple({
  name,
  value,
  setValue,
  defaultCountry = "SY",
  error,
}) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneValue, setPhoneValue] = useState(value || "");

  const maxLen = phoneLengths[selectedCountry] || 20;

  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > maxLen) val = val.slice(0, maxLen);
    setPhoneValue(val);

    let calling = "";
    try {
      const c = phoneUtil.getCountryCodeForRegion(selectedCountry);
      calling = c ? `+${c}` : "";
    } catch {}

    setValue(name, calling + val);
  };

  const options = useMemo(() => {
    return Object.keys(phoneLengths).map((iso) => {
      let calling = "";
      try {
        const c = phoneUtil.getCountryCodeForRegion(iso);
        calling = c ? `+${c}` : "";
      } catch {}
      return { iso, calling };
    });
  }, []);

  return (
    <div className="flex flex-col gap-1 text-right">
      <label className="text-sm text-gray-700 font-medium">رقم الهاتف</label>

      <div className="flex" dir="rtl">
        <select
          value={selectedCountry}
          onChange={(e) => {
            const newCountry = e.target.value;
            setSelectedCountry(newCountry);
            setPhoneValue("");
            setValue(name, "");
          }}
          className="border border-gray-200 rounded-r-lg p-2 bg-gray-50 text-sm"
        >
          {options.map(({ iso, calling }) => (
            <option key={iso} value={iso}>
              {iso} {calling}
            </option>
          ))}
        </select>

        <input
          type="tel"
          value={phoneValue}
          onChange={handleChange}
          placeholder={`أدخل رقم الهاتف (حتى ${maxLen} أرقام)`}
          maxLength={maxLen}
          className="flex-1 border border-gray-200 rounded-l-lg p-2 text-sm text-right"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
