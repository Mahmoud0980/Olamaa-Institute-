"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneNumberUtil } from "google-libphonenumber";
import { phoneLengths } from "@/lib/helpers/phoneLengths";

const phoneUtil = PhoneNumberUtil.getInstance();

export default function PhoneInputEdit({
  name,
  value, // +9639xxxxxxxx
  setValue,
}) {
  const [selectedCountry, setSelectedCountry] = useState("SY");
  const [phoneValue, setPhoneValue] = useState("");

  useEffect(() => {
    if (!value) {
      setSelectedCountry("SY");
      setPhoneValue("");
      return;
    }

    try {
      const parsed = phoneUtil.parse(value);
      const region = phoneUtil.getRegionCodeForNumber(parsed);

      let national = parsed.getNationalNumber().toString();

      // ✅ سوريا: رجّع الصفر المحلي
      if ((region || "SY") === "SY" && national && !national.startsWith("0")) {
        national = `0${national}`;
      }

      setSelectedCountry(region || "SY");
      setPhoneValue(national);
    } catch {
      setSelectedCountry("SY");

      let cleaned = String(value).replace(/[^\d]/g, "");

      // ✅ إذا الرقم جاي بصيغة 9639xxxxxxx نحوله إلى 09xxxxxxx
      if (cleaned.startsWith("963")) {
        cleaned = `0${cleaned.slice(3)}`;
      }

      setPhoneValue(cleaned);
    }
  }, [value]);

  const maxLen = phoneLengths[selectedCountry] || 20;

  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    if (selectedCountry === "SY") {
      if (val.length === 1 && val !== "0") return;
      if (val.length >= 2 && !val.startsWith("09")) return;
    }

    if (val.length > maxLen) val = val.slice(0, maxLen);

    setPhoneValue(val);

    let calling = "";
    try {
      const c = phoneUtil.getCountryCodeForRegion(selectedCountry);
      calling = c ? `+${c}` : "";
    } catch {}

    if (typeof setValue === "function") {
      if (name !== undefined) {
        setValue(name, calling + val);
      } else {
        setValue(calling + val);
      }
    }
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
      <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>

      <div className="flex" dir="rtl">
        <select
          value={selectedCountry}
          onChange={(e) => {
            const newCountry = e.target.value;
            setSelectedCountry(newCountry);
            setPhoneValue("");

            let calling = "";
            try {
              const c = phoneUtil.getCountryCodeForRegion(newCountry);
              calling = c ? `+${c}` : "";
            } catch {}

            if (typeof setValue === "function") {
              if (name !== undefined) {
                setValue(name, "");
              } else {
                setValue("");
              }
            }
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
          maxLength={maxLen}
          className="flex-1 border border-gray-200 rounded-l-lg p-2 text-sm text-right"
        />
      </div>
    </div>
  );
}
