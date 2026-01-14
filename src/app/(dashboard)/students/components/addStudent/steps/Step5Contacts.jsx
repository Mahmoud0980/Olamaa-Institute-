"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

/* ================= constants ================= */
const TYPE_OPTIONS = [
  { key: "phone", value: "phone", label: "هاتف" },
  { key: "whatsapp", value: "whatsapp", label: "واتساب" },
  { key: "email", value: "email", label: "إيميل" },
];

const TYPE_LABEL = {
  phone: "هاتف",
  whatsapp: "واتساب",
  email: "إيميل",
};

const clean = (v) => String(v ?? "").trim();

/* ================= component ================= */
export default function Step5Contacts({
  guardians = [],
  existingContacts = [],
  onSaveAll,
  onBack,
}) {
  /* ---------- guardians options ---------- */
  const guardianOptions = useMemo(() => {
    return (guardians || []).map((g, idx) => {
      const full =
        g?.full_name ||
        `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() ||
        `Guardian #${g?.id}`;

      const rel =
        g?.relationship === "father"
          ? "الأب"
          : g?.relationship === "mother"
          ? "الأم"
          : "";

      return {
        key: `${g?.id}-${idx}`,
        value: String(g?.id),
        label: rel ? `${rel} — ${full}` : full,
      };
    });
  }, [guardians]);

  /* ---------- state ---------- */
  const [draft, setDraft] = useState({
    guardian_id: "",
    type: "",
    value: "",
    country_code: "",
    phone_number: "",
    notes: "",
    is_primary: false,
  });

  const [items, setItems] = useState([]);

  /* ---------- helpers ---------- */
  const canAdd = () => {
    if (!draft.guardian_id) return false;
    if (!draft.type) return false;

    if (draft.type === "email") {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value);
    }

    // phone / whatsapp
    return !!draft.country_code && !!draft.phone_number;
  };

  const addItem = () => {
    if (!canAdd()) return;

    const payload = {
      guardian_id: Number(draft.guardian_id),
      type: draft.type,
      value:
        draft.type === "email" ? clean(draft.value) : clean(draft.phone_number),
      country_code: draft.type === "email" ? null : clean(draft.country_code),
      phone_number: draft.type === "email" ? null : clean(draft.phone_number),
      notes: clean(draft.notes) || "",
      is_primary: !!draft.is_primary,
    };

    setItems((prev) => {
      let next = [...prev, payload];

      // واحد primary لكل ولي أمر
      if (payload.is_primary) {
        next = next.map((x) =>
          x.guardian_id === payload.guardian_id && x !== payload
            ? { ...x, is_primary: false }
            : x
        );
      }

      return next;
    });

    setDraft((d) => ({
      guardian_id: d.guardian_id,
      type: "",
      value: "",
      country_code: "",
      phone_number: "",
      notes: "",
      is_primary: false,
    }));
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSaveAll?.(items);
  };

  const guardianName = (gid) => {
    const g = guardians.find((x) => String(x?.id) === String(gid));
    if (!g) return `#${gid}`;

    const full =
      g?.full_name ||
      `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() ||
      `#${gid}`;

    const rel =
      g?.relationship === "father"
        ? "الأب"
        : g?.relationship === "mother"
        ? "الأم"
        : "";

    return rel ? `${rel} — ${full}` : full;
  };

  /* ================= render ================= */
  return (
    <div className="space-y-4">
      <h3 className="text-[#6F013F] font-semibold text-sm">معلومات التواصل</h3>

      {/* إضافة جهة تواصل */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700">إضافة جهة تواصل</p>

        {/* guardian */}
        <SearchableSelect
          label="اختر ولي الأمر"
          required
          value={draft.guardian_id}
          onChange={(v) => setDraft((d) => ({ ...d, guardian_id: v }))}
          options={guardianOptions}
          placeholder="اختر الأب أو الأم"
          allowClear
        />

        {/* type */}
        <SearchableSelect
          label="نوع جهة الاتصال"
          required
          value={draft.type}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              type: v,
              value: "",
              country_code: "",
              phone_number: "",
            }))
          }
          options={TYPE_OPTIONS}
          placeholder="اختر النوع"
          allowClear
        />

        {/* phone / whatsapp */}
        {(draft.type === "phone" || draft.type === "whatsapp") && (
          <PhoneInputSplit
            countryCode={draft.country_code}
            phoneNumber={draft.phone_number}
            onChange={({ country_code, phone_number }) =>
              setDraft((d) => ({
                ...d,
                country_code,
                phone_number,
                value: phone_number,
              }))
            }
          />
        )}

        {/* email */}
        {draft.type === "email" && (
          <InputField
            label="البريد الإلكتروني"
            type="email"
            required
            placeholder="example@email.com"
            register={{
              name: "email",
              value: draft.value,
              onChange: (e) =>
                setDraft((d) => ({ ...d, value: e.target.value })),
            }}
            error=""
          />
        )}

        {/* notes */}
        <InputField
          label="ملاحظات (اختياري)"
          placeholder="..."
          register={{
            name: "notes",
            value: draft.notes,
            onChange: (e) => setDraft((d) => ({ ...d, notes: e.target.value })),
          }}
          error=""
        />

        {/* primary */}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="accent-[#6F013F]"
            checked={!!draft.is_primary}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                is_primary: e.target.checked,
              }))
            }
          />
          جهة الاتصال الأساسية (Primary)
        </label>

        <button
          type="button"
          onClick={addItem}
          disabled={!canAdd()}
          className={`w-full py-2 rounded-lg text-sm transition ${
            canAdd()
              ? "bg-[#6F013F] text-white hover:bg-[#580131]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          إضافة
        </button>
      </div>

      {/* القائمة */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-gray-500">
            لم تتم إضافة أي جهة تواصل بعد.
          </p>
        ) : (
          items.map((it, idx) => (
            <div
              key={`${it.guardian_id}-${it.type}-${idx}`}
              className="border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-800">
                  {guardianName(it.guardian_id)}
                </p>
                <p className="text-xs text-gray-600">
                  النوع: {TYPE_LABEL[it.type] || it.type}
                </p>

                {it.type === "email" ? (
                  <p className="text-xs text-gray-600">القيمة: {it.value}</p>
                ) : (
                  <p className="text-xs text-gray-600">
                    الرقم: {it.country_code} {it.phone_number}
                  </p>
                )}

                {it.notes && (
                  <p className="text-xs text-gray-500">ملاحظات: {it.notes}</p>
                )}

                {it.is_primary && (
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-[#6F013F]">
                    Primary
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-gray-500 hover:text-red-500 transition"
                title="حذف"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* أزرار الخطوة */}
      <StepButtonsSmart
        step={5}
        total={6}
        onNext={handleSave}
        onBack={onBack}
      />
    </div>
  );
}
