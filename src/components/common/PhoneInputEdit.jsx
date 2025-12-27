"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneNumberUtil } from "google-libphonenumber";
import { phoneLengths } from "@/lib/helpers/phoneLengths";

const phoneUtil = PhoneNumberUtil.getInstance();

export default function PhoneInputEdit({
  name,
  value, // +963999999999
  setValue,
}) {
  const [selectedCountry, setSelectedCountry] = useState("SY");
  const [phoneValue, setPhoneValue] = useState("");

  /* =============================
     تفكيك الرقم القادم من API
  ============================== */
  useEffect(() => {
    if (!value) return;

    try {
      const parsed = phoneUtil.parse(value);
      const region = phoneUtil.getRegionCodeForNumber(parsed);

      setSelectedCountry(region || "SY");
      setPhoneValue(parsed.getNationalNumber().toString());
    } catch {
      // fallback
      setSelectedCountry("SY");
      setPhoneValue(value.replace(/^\+\d+/, ""));
    }
  }, [value]);

  const maxLen = phoneLengths[selectedCountry] || 20;

  /* =============================
     عند التغيير
  ============================== */
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
      <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>

      <div className="flex" dir="rtl">
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
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
          maxLength={maxLen}
          className="flex-1 border border-gray-200 rounded-l-lg p-2 text-sm text-right"
        />
      </div>
    </div>
  );
}
