"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import GradientButton from "@/components/common/GradientButton";

import { notify } from "@/lib/helpers/toastify";

/* constants */
const TYPE_OPTIONS = [
  { key: "phone", value: "phone", label: "هاتف" },
  { key: "whatsapp", value: "whatsapp", label: "واتساب" },
];

const TYPE_LABEL = {
  phone: "هاتف",
  whatsapp: "واتساب",
};

const clean = (v) => String(v ?? "").trim();

export default function Step5Contacts({
  guardians = [],
  existingContacts = [],
  onSaveAll,
  onBack,
  loading = false,
}) {
  /* guardians options */
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

  /* state */
  const [draft, setDraft] = useState({
    guardian_id: "",
    type: "",
    country_code: "",
    phone_number: "",
    notes: "",
    is_primary: false,
  });

  const [items, setItems] = useState([]);

  /* derived */
  const hasPhonePrimary = useMemo(
    () => items.some((x) => x.type === "phone" && x.is_primary),
    [items],
  );

  const phonePrimaryOwner = useMemo(() => {
    const it = items.find((x) => x.type === "phone" && x.is_primary);
    return it?.guardian_id ? String(it.guardian_id) : null;
  }, [items]);

  /* helpers */
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

  const canAdd = () => {
    if (!draft.guardian_id) return false;
    if (!draft.type) return false;

    if (!draft.country_code) return false;
    if (!draft.phone_number) return false;

    const n = clean(draft.notes);
    if (n.length > 200) return false; // notes optional

    return true;
  };

  const addItem = () => {
    if (!canAdd()) {
      notify.error("يرجى تعبئة جميع الحقول المطلوبة", "تحقق من البيانات");
      return;
    }

    if (draft.type === "phone" && draft.is_primary && hasPhonePrimary) {
      notify.error(
        "مسموح رقم هاتف واحد فقط كجهة اتصال أساسية (Primary)",
        "تنبيه",
      );
      return;
    }

    const payload = {
      guardian_id: Number(draft.guardian_id),
      type: draft.type,
      value: clean(draft.phone_number),
      country_code: clean(draft.country_code),
      phone_number: clean(draft.phone_number),
      notes: clean(draft.notes) || "",
      is_primary: !!draft.is_primary,
    };

    setItems((prev) => [...prev, payload]);

    setDraft((d) => ({
      guardian_id: d.guardian_id,
      type: "",
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
    if (!items.length) {
      notify.error("أضف جهة تواصل واحدة على الأقل", "تحقق من البيانات");
      return;
    }
    onSaveAll?.(items);
  };

  const showPrimaryCheckbox =
    !!draft.type &&
    (draft.type === "whatsapp" || (draft.type === "phone" && !hasPhonePrimary));

  const primaryHint =
    draft.type === "phone" && hasPhonePrimary
      ? `هناك رقم هاتف أساسي محدد مسبقًا (${guardianName(
          phonePrimaryOwner,
        )}). لا يمكن تحديد رقم هاتف أساسي آخر.`
      : "";

  return (
    <div className="space-y-4">
      <h3 className="text-[#6F013F] font-semibold text-sm">معلومات التواصل</h3>

      {/* add contact */}
      <div className="space-y-3 border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700">إضافة جهة تواصل</p>

        <SearchableSelect
          label="اختر ولي الأمر"
          required
          value={draft.guardian_id}
          onChange={(v) => setDraft((d) => ({ ...d, guardian_id: v }))}
          options={guardianOptions}
          placeholder="اختر الأب أو الأم"
          allowClear
        />

        <SearchableSelect
          label="نوع جهة الاتصال"
          required
          value={draft.type}
          onChange={(v) =>
            setDraft((d) => ({
              ...d,
              type: v,
              country_code: "",
              phone_number: "",
              notes: "",
              is_primary: false,
            }))
          }
          options={TYPE_OPTIONS}
          placeholder="اختر النوع"
          allowClear
        />

        {(draft.type === "phone" || draft.type === "whatsapp") && (
          <PhoneInputSplit
            countryCode={draft.country_code}
            phoneNumber={draft.phone_number}
            onChange={({ country_code, phone_number }) =>
              setDraft((d) => ({ ...d, country_code, phone_number }))
            }
          />
        )}

        <InputField
          label="ملاحظات (اختياري)"
          placeholder="200 محرف كحد أقصى"
          register={{
            name: "notes",
            value: draft.notes,
            onChange: (e) => {
              const v = e.target.value;
              if (String(v).length > 200) return;
              setDraft((d) => ({ ...d, notes: v }));
            },
          }}
          error=""
        />

        {showPrimaryCheckbox ? (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="accent-[#6F013F]"
              checked={!!draft.is_primary}
              onChange={(e) =>
                setDraft((d) => ({ ...d, is_primary: e.target.checked }))
              }
            />
            جهة الاتصال الأساسية (Primary)
          </label>
        ) : primaryHint ? (
          <div className="text-xs text-gray-500">{primaryHint}</div>
        ) : null}

        <GradientButton
          type="button"
          onClick={addItem}
          disabled={!canAdd()}
          className="flex justify-end py-2"
        >
          إضافة
        </GradientButton>
      </div>

      {/* list */}
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

                <p className="text-xs text-gray-600">
                  الرقم: {it.country_code} {it.phone_number}
                </p>

                {it.notes ? (
                  <p className="text-xs text-gray-500">ملاحظات: {it.notes}</p>
                ) : null}

                {it.is_primary && (
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-[#6F013F]">
                    Primary
                  </span>
                )}
              </div>

              <GradientButton
                type="button"
                onClick={() => removeItem(idx)}
                className="px-2 py-1 bg-gradient-to-r from-red-500 to-rose-600"
                leftIcon={<X className="w-4 h-4" />}
              />
            </div>
          ))
        )}
      </div>

      <StepButtonsSmart
        step={5}
        total={6}
        onNext={handleSave}
        onBack={onBack}
        loading={loading}
      />
    </div>
  );
}
