"use client";

import { useMemo, useState, useEffect } from "react";
import { PhoneNumberUtil } from "google-libphonenumber";
import { phoneLengths } from "@/lib/helpers/phoneLengths";

const phoneUtil = PhoneNumberUtil.getInstance();

export default function PhoneInputSplit({
  countryCode,
  phoneNumber,
  onChange,
  defaultCountry = "SY",
  error,
  label = "رقم الهاتف",
}) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [localNumber, setLocalNumber] = useState("");

  const maxLen = phoneLengths[selectedCountry] || 20;

  /* ===== country options ===== */
  const options = useMemo(() => {
    return Object.keys(phoneLengths).map((iso) => {
      let calling = "";
      try {
        const c = phoneUtil.getCountryCodeForRegion(iso);
        calling = c ? `+${c}` : "";
      } catch { }
      return { iso, calling };
    });
  }, []);

  /* ===== SYNC FROM PROPS ===== */
  useEffect(() => {
    if (phoneNumber !== undefined) {
      setLocalNumber(phoneNumber || "");
    }

    if (countryCode) {
      const iso = options.find((o) => o.calling === countryCode)?.iso;
      if (iso) setSelectedCountry(iso);
    }
  }, [phoneNumber, countryCode, options]);

  /* ===== emit value ===== */
  const emitChange = (iso, number) => {
    let calling = "";
    try {
      const c = phoneUtil.getCountryCodeForRegion(iso);
      calling = c ? `+${c}` : "";
    } catch { }

    onChange?.({
      country_code: calling,
      phone_number: number,
    });
  };

  /* ===== handlers ===== */
  const handleNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    // ✅ مسموح فقط بداية 9 أو 09
    if (val.length === 1) {
      if (!(val === "9" || val === "0")) return;
    } else if (val.length >= 2) {
      if (!(val.startsWith("9") || val.startsWith("09"))) return;
    }

    if (val.length > maxLen) val = val.slice(0, maxLen);

    setLocalNumber(val);
    emitChange(selectedCountry, val);
  };

  const handleCountryChange = (e) => {
    const iso = e.target.value;
    setSelectedCountry(iso);
    emitChange(iso, localNumber);
  };

  return (
    <div className="flex flex-col gap-1 text-right">
      <label className="text-sm text-gray-700 font-medium">{label}</label>

      <div className="flex" dir="rtl">
        <select
          value={selectedCountry}
          onChange={handleCountryChange}
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
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={`حتى ${maxLen} أرقام`}
          maxLength={maxLen}
          className="flex-1 border border-gray-200 rounded-l-lg p-2 text-sm text-right"
        />
      </div>

      {selectedCountry === "SY" && (
        <p className="text-[10px] text-gray-400 mt-1">
          يجب أن يبدو الرقم هكذا: 09xxxxxxxx أو 9xxxxxxxx
        </p>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
