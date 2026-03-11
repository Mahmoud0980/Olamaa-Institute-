"use client";

import { useMemo, useState, useEffect } from "react";
import { X } from "lucide-react";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import GradientButton from "@/components/common/GradientButton";
import Checkbox from "@/components/common/Checkbox";

import { notify } from "@/lib/helpers/toastify";
import DatePickerSmart from "@/components/common/DatePickerSmart";

/* constants */
const TYPE_OPTIONS = [
  { key: "phone", value: "phone", label: "هاتف محمول" },
  { key: "landline", value: "landline", label: "هاتف أرضي" },
];

const OWNER_TYPE_OPTIONS = [
  { key: "father", value: "father", label: "الأب" },
  { key: "mother", value: "mother", label: "الأم" },
  { key: "student", value: "student", label: "الطالب نفسه" },
  { key: "sibling", value: "sibling", label: "أخ / أخت" },
  { key: "relative", value: "relative", label: "قريب آخر" },
  { key: "other", value: "other", label: "أخرى" },
];

const SYRIA_CITY_CODES = [
  { key: "011", value: "011", label: "011 - دمشق وريفها" },
  { key: "021", value: "021", label: "021 - حلب" },
  { key: "031", value: "031", label: "031 - حمص" },
  { key: "033", value: "033", label: "033 - حماة" },
  { key: "041", value: "041", label: "041 - اللاذقية" },
  { key: "043", value: "043", label: "043 - طرطوس" },
  { key: "015", value: "015", label: "015 - درعا" },
  { key: "016", value: "016", label: "016 - السويداء" },
  { key: "014", value: "014", label: "014 - القنيطرة" },
  { key: "022", value: "022", label: "022 - الرقة" },
  { key: "051", value: "051", label: "051 - دير الزور" },
  { key: "052", value: "052", label: "052 - الحسكة" },
  { key: "023", value: "023", label: "023 - إدلب" },
];

const clean = (v) => String(v ?? "").trim();

export default function Step5Contacts({
  studentId,
  familyId,
  guardians = [],
  existingContacts = [],
  onSaveAll,
  onBack,
  onSkip,
  loading = false,
}) {
  /* state */
  const [draft, setDraft] = useState({
    type: "phone",
    owner_type: "",
    guardian_id: "",
    owner_name: "",
    country_code: "+963",
    phone_number: "",
    supports_call: false,
    supports_whatsapp: false,
    supports_sms: false,
    is_sms_stopped: false,
    stop_sms_from: "",
    stop_sms_to: "",
    notes: "",
  });

  const [items, setItems] = useState(existingContacts || []);

  useEffect(() => {
    if (items.length === 0 && existingContacts?.length > 0) {
      setItems(existingContacts);
    }
  }, [existingContacts]);

  /* derived options */
  const hasSmsContact = useMemo(
    () => items.some((x) => x.type === "phone" && x.supports_sms),
    [items],
  );

  const fatherOptions = useMemo(() => {
    return (guardians || [])
      .filter((g) => g?.relationship === "father")
      .map((g, idx) => ({
        key: `${g?.id}-${idx}`,
        value: String(g?.id),
        label:
          g?.full_name ||
          `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() ||
          `الأب #${g?.id}`,
      }));
  }, [guardians]);

  const motherOptions = useMemo(() => {
    return (guardians || [])
      .filter((g) => g?.relationship === "mother")
      .map((g, idx) => ({
        key: `${g?.id}-${idx}`,
        value: String(g?.id),
        label:
          g?.full_name ||
          `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() ||
          `الأم #${g?.id}`,
      }));
  }, [guardians]);

  /* helpers */
  const guardianName = (gid) => {
    const g = guardians.find((x) => String(x?.id) === String(gid));
    if (!g) return `#${gid}`;
    return (
      g?.full_name ||
      `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() ||
      `#${gid}`
    );
  };

  const getOwnerLabel = (it) => {
    if (it.type === "landline") return "هاتف المنزل (العائلة)";

    const map = {
      father: "الأب",
      mother: "الأم",
      student: "الطالب",
      sibling: "أخ / أخت",
      relative: "قريب",
      other: "آخر",
    };
    let base = map[it.owner_type] || it.owner_type;

    if (it.owner_type === "father" || it.owner_type === "mother") {
      base += ` - ${guardianName(it.guardian_id)}`;
    } else if (it.owner_name) {
      base += ` (${it.owner_name})`;
    }
    return base;
  };

  const handleOwnerTypeChange = (v) => {
    let autoGuardianId = "";
    if (v === "father" && fatherOptions.length === 1) {
      autoGuardianId = fatherOptions[0].value;
    } else if (v === "mother" && motherOptions.length === 1) {
      autoGuardianId = motherOptions[0].value;
    }
    setDraft((d) => ({
      ...d,
      owner_type: v,
      guardian_id: autoGuardianId,
      owner_name: "",
    }));
  };

  const handleTypeChange = (v) => {
    setDraft((d) => ({
      ...d,
      type: v,
      owner_type: "",
      guardian_id: "",
      owner_name: "",
      country_code: v === "landline" ? "021" : "+963",
      supports_call: false,
      supports_whatsapp: false,
      supports_sms: false,
      is_sms_stopped: false,
      stop_sms_from: "",
      stop_sms_to: "",
    }));
  };

  const canAdd = () => {
    // Basic validation
    if (!draft.type) return false;
    if (!draft.phone_number) return false;

    if (draft.type === "phone") {
      if (!draft.owner_type) return false;
      if (
        (draft.owner_type === "father" || draft.owner_type === "mother") &&
        !draft.guardian_id
      )
        return false;
      if (!draft.country_code) return false;
      if (
        !draft.supports_call &&
        !draft.supports_whatsapp &&
        !draft.supports_sms
      )
        return false;

      if (draft.supports_sms && draft.is_sms_stopped) {
        if (!draft.stop_sms_from || !draft.stop_sms_to) return false;
      }
    }

    if (clean(draft.notes).length > 200) return false;

    return true;
  };

  const addItem = () => {
    if (!canAdd()) {
      notify.error(
        "يرجى تعبئة جميع الحقول المطلوبة واختيار غرض واحد للرقم على الأقل",
        "تحقق من البيانات",
      );
      return;
    }

    const payload = {
      type: draft.type,
      phone_number: clean(draft.phone_number),
      notes: clean(draft.notes) || "",
    };

    if (draft.type === "phone") {
      payload.country_code = clean(draft.country_code);
      payload.owner_type = draft.owner_type;

      if (draft.owner_type === "father" || draft.owner_type === "mother") {
        payload.guardian_id = Number(draft.guardian_id);
      } else if (draft.owner_type === "student") {
        payload.student_id = studentId;
      } else {
        payload.family_id = familyId;
        if (clean(draft.owner_name)) {
          payload.owner_name = clean(draft.owner_name);
        }
      }

      payload.supports_call = !!draft.supports_call;
      payload.supports_whatsapp = !!draft.supports_whatsapp;
      payload.supports_sms = !!draft.supports_sms;
      payload.is_sms_stopped = !!(payload.supports_sms && draft.is_sms_stopped);

      if (payload.is_sms_stopped) {
        payload.stop_sms_from = clean(draft.stop_sms_from) || null;
        payload.stop_sms_to = clean(draft.stop_sms_to) || null;
      } else {
        payload.stop_sms_from = null;
        payload.stop_sms_to = null;
      }
    } else if (draft.type === "landline") {
      if (clean(draft.country_code))
        payload.country_code = clean(draft.country_code);
      payload.owner_type = "family";
      payload.family_id = familyId;
    }

    setItems((prev) => [...prev, payload]);

    setDraft((d) => ({
      ...d,
      guardian_id: "",
      owner_name: "",
      phone_number: "",
      supports_call: false,
      supports_whatsapp: false,
      supports_sms: false,
      is_sms_stopped: false,
      stop_sms_from: "",
      stop_sms_to: "",
      notes: "",
    }));
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSaveAll?.(items);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pt-1">
        <h3 className="text-[#6F013F] font-semibold text-sm">
          معلومات التواصل
        </h3>

        {/* add contact */}
        <div className="space-y-3 border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700">إضافة رقم جديد</p>

          <SearchableSelect
            label="نوع الرقم"
            value={draft.type}
            onChange={handleTypeChange}
            options={TYPE_OPTIONS}
            placeholder="اختر النوع"
          />

          {draft.type === "phone" && (
            <>
              <SearchableSelect
                label="لمن هذا الرقم؟ (صاحب الرقم)"
                value={draft.owner_type}
                onChange={handleOwnerTypeChange}
                options={OWNER_TYPE_OPTIONS}
                placeholder="اختر المالك"
              />

              {draft.owner_type === "father" &&
                (fatherOptions.length === 1 ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">
                      الأب
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {fatherOptions[0].label}
                    </div>
                  </div>
                ) : fatherOptions.length === 0 ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">
                      الأب
                    </label>
                    <div className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      لا يوجد أب مضاف لهذا الطالب
                    </div>
                  </div>
                ) : (
                  <SearchableSelect
                    label="اختر الأب"
                    value={draft.guardian_id}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, guardian_id: v }))
                    }
                    options={fatherOptions}
                    placeholder="تحديد الأب"
                    allowClear
                  />
                ))}

              {draft.owner_type === "mother" &&
                (motherOptions.length === 1 ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">
                      الأم
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                      {motherOptions[0].label}
                    </div>
                  </div>
                ) : motherOptions.length === 0 ? (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 block">
                      الأم
                    </label>
                    <div className="w-full px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      لا توجد أم مضافة لهذا الطالب
                    </div>
                  </div>
                ) : (
                  <SearchableSelect
                    label="اختر الأم"
                    value={draft.guardian_id}
                    onChange={(v) =>
                      setDraft((d) => ({ ...d, guardian_id: v }))
                    }
                    options={motherOptions}
                    placeholder="تحديد الأم"
                    allowClear
                  />
                ))}

              {["sibling", "relative", "other"].includes(draft.owner_type) && (
                <InputField
                  label="الاسم التوضيحي لصاحب الرقم (مثلاً: أخ الطالب الأكبر)"
                  placeholder="اختياري للتمييز"
                  register={{
                    name: "owner_name",
                    value: draft.owner_name,
                    onChange: (e) =>
                      setDraft((d) => ({ ...d, owner_name: e.target.value })),
                  }}
                />
              )}
            </>
          )}

          {draft.type === "phone" ? (
            <PhoneInputSplit
              countryCode={draft.country_code}
              phoneNumber={draft.phone_number}
              onChange={({ country_code, phone_number }) =>
                setDraft((d) => ({ ...d, country_code, phone_number }))
              }
            />
          ) : (
            <div className="flex gap-2 items-start">
              <div className="w-1/3">
                <SearchableSelect
                  label="رمز المنطقة"
                  value={draft.country_code}
                  onChange={(v) => setDraft((d) => ({ ...d, country_code: v }))}
                  options={SYRIA_CITY_CODES}
                  placeholder="مثل 011"
                  allowClear
                />
              </div>
              <div className="w-2/3">
                <InputField
                  label="رقم الهاتف الأرضي"
                  placeholder="2134567"
                  register={{
                    name: "phone_number",
                    value: draft.phone_number,
                    onChange: (e) =>
                      setDraft((d) => ({ ...d, phone_number: e.target.value })),
                  }}
                />
              </div>
            </div>
          )}

          {draft.type === "phone" && (
            <div className="border border-gray-100 bg-gray-50/50 p-3 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                الغرض من الرقم (يجب تفعيل خيار واحد على الأقل)
              </p>
              <div className="flex gap-4">
                <Checkbox
                  label="اتصال"
                  checked={draft.supports_call}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, supports_call: e.target.checked }))
                  }
                />
                <Checkbox
                  label="واتساب"
                  checked={draft.supports_whatsapp}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      supports_whatsapp: e.target.checked,
                    }))
                  }
                />
                <Checkbox
                  label={
                    hasSmsContact
                      ? "الرسائل النصية (مضاف رقم مسبقاً)"
                      : "رسائل نصية (SMS)"
                  }
                  labelClassName={`text-xs ${hasSmsContact ? "text-gray-400" : "text-gray-700"}`}
                  disabled={hasSmsContact}
                  checked={draft.supports_sms}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      supports_sms: e.target.checked,
                      is_sms_stopped: e.target.checked ? d.is_sms_stopped : false,
                      stop_sms_from: e.target.checked ? d.stop_sms_from : "",
                      stop_sms_to: e.target.checked ? d.stop_sms_to : "",
                    }))
                  }
                />
              </div>

              {/* ✅ خيار إيقاف الرسائل مؤقتاً */}
              {draft.supports_sms && (
                <div className="mr-2 mt-2 p-3 border border-dashed border-gray-200 rounded-lg bg-white space-y-3">
                  <Checkbox
                    label="تفعيل فترة إيقاف للرسائل النصية"
                    labelClassName="text-xs text-gray-700 font-medium"
                    checked={draft.is_sms_stopped}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        is_sms_stopped: e.target.checked,
                        stop_sms_from: e.target.checked ? d.stop_sms_from : "",
                        stop_sms_to: e.target.checked ? d.stop_sms_to : "",
                      }))
                    }
                  />

                  {draft.is_sms_stopped && (
                    <div className="flex gap-3 animate-in fade-in duration-200">
                      <div className="flex-1">
                        <DatePickerSmart
                          label="من تاريخ"
                          value={draft.stop_sms_from}
                          onChange={(v) =>
                            setDraft((d) => ({ ...d, stop_sms_from: v }))
                          }
                          placeholder="بداية الإيقاف"
                        />
                      </div>
                      <div className="flex-1">
                        <DatePickerSmart
                          label="إلى تاريخ"
                          value={draft.stop_sms_to}
                          onChange={(v) =>
                            setDraft((d) => ({ ...d, stop_sms_to: v }))
                          }
                          placeholder="نهاية الإيقاف"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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
        <div className="space-y-2 pb-4">
          {items.length === 0 ? (
            <p className="text-xs text-gray-500">
              لم تتم إضافة أي جهة تواصل بعد.
            </p>
          ) : (
            items.map((it, idx) => (
              <div
                key={`${it.type}-${it.phone_number}-${idx}`}
                className="border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-800">
                    {getOwnerLabel(it)}
                  </p>

                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    <span>
                      النوع: {it.type === "landline" ? "أرضي" : "محمول"}
                    </span>
                    {it.type === "phone" && (
                      <span className="flex gap-1">
                        [{it.supports_call ? "اتصال" : ""}
                        {it.supports_call &&
                          (it.supports_whatsapp || it.supports_sms)
                          ? " | "
                          : ""}
                        {it.supports_whatsapp ? "واتساب" : ""}
                        {it.supports_whatsapp && it.supports_sms ? " | " : ""}
                        {it.supports_sms ? "رسائل" : ""}]
                      </span>
                    )}
                  </p>

                  <p
                    className="text-xs text-gray-600"
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  >
                    {it.country_code ? `${it.country_code} ` : ""}
                    {it.phone_number}
                  </p>

                  {it.notes ? (
                    <p className="text-xs text-gray-500">ملاحظات: {it.notes}</p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="إزالة الرقم"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="shrink-0 mt-2 pt-4 border-t border-gray-100 flex justify-between items-center bg-white">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-gray-500 hover:text-[#6F013F] transition"
        >
          تخطي هذه الخطوة
        </button>

        <StepButtonsSmart
          step={5}
          total={6}
          onNext={handleSave}
          onBack={onBack}
          loading={loading}
        />
      </div>
    </div>
  );
}
