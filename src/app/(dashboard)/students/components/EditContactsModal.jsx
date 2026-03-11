"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import InputField from "@/components/common/InputField";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";
import GradientButton from "@/components/common/GradientButton";
import Checkbox from "@/components/common/Checkbox";

import {
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "@/store/services/contactsApi";

/* ================= constants ================= */
const TYPE_OPTIONS = [
  { key: "phone", value: "phone", label: "هاتف محمول" },
  { key: "landline", value: "landline", label: "هاتف أرضي" },
];

const TYPE_LABEL = {
  phone: "هاتف محمول",
  landline: "هاتف أرضي",
};

const OWNER_LABEL = {
  father: "الأب",
  mother: "الأم",
  student: "الطالب",
  sibling: "أخ / أخت",
  relative: "قريب",
  other: "أخرى",
  family: "العائلة / المنزل",
};

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

const FAMILY_BASED_OWNER_TYPES = new Set([
  "sibling",
  "relative",
  "other",
  "family",
]);

const clean = (v) => String(v ?? "").trim();

const toBool = (v) =>
  v === true || v === 1 || v === "1" || String(v).toLowerCase() === "true";

const asArray = (v) => {
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v)) return v;
  return [];
};

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const splitFromFull = (full) => {
  const v = clean(full);
  if (!v) return { country_code: "", phone_number: "" };

  const m = v.match(/^(\+\d{1,4})(\d+)$/);
  if (m) return { country_code: m[1], phone_number: m[2] };

  const cc = v.startsWith("+") ? v.match(/^\+\d{1,4}/)?.[0] || "" : "";
  const pn = v.replace(cc, "").replace(/\D/g, "");
  return { country_code: cc, phone_number: pn };
};

const pickGuardianByRelationship = (guardians, relationship) =>
  (guardians || []).find((g) => g?.relationship === relationship) || null;

const getGuardianDisplayName = (guardian) => {
  if (!guardian) return "";
  const full =
    guardian?.full_name ||
    `${guardian?.first_name ?? ""} ${guardian?.last_name ?? ""}`.trim() ||
    `#${guardian?.id}`;

  const rel =
    guardian?.relationship === "father"
      ? "الأب"
      : guardian?.relationship === "mother"
        ? "الأم"
        : "";

  return rel ? `${rel} — ${full}` : full;
};

const resolveGuardianIdByOwnerType = (ownerType, father, mother) => {
  if (ownerType === "father") return father?.id ?? null;
  if (ownerType === "mother") return mother?.id ?? null;
  return null;
};

const getOwnerOptions = ({ type, father, mother, studentId, familyId }) => {
  if (type === "landline") {
    return familyId
      ? [{ key: "family", value: "family", label: "العائلة / المنزل" }]
      : [];
  }

  return [
    father
      ? {
          key: "father",
          value: "father",
          label: getGuardianDisplayName(father),
        }
      : null,
    mother
      ? {
          key: "mother",
          value: "mother",
          label: getGuardianDisplayName(mother),
        }
      : null,
    studentId ? { key: "student", value: "student", label: "الطالب" } : null,
    familyId ? { key: "sibling", value: "sibling", label: "أخ / أخت" } : null,
    familyId ? { key: "relative", value: "relative", label: "قريب" } : null,
    familyId ? { key: "other", value: "other", label: "أخرى" } : null,
  ].filter(Boolean);
};

const emptyDraft = () => ({
  id: null,
  _cid: null,
  type: "",
  owner_type: "",
  owner_name: "",
  country_code: "",
  phone_number: "",
  supports_call: false,
  supports_whatsapp: false,
  supports_sms: false,
  notes: "",
});

const collectExistingContacts = (student) => {
  const all = [];

  all.push(...asArray(student?.contact_details));
  all.push(...asArray(student?.contacts));
  all.push(...asArray(student?.family?.contact_details));
  all.push(...asArray(student?.family?.contacts));

  (student?.family?.guardians || []).forEach((g) => {
    all.push(...asArray(g?.contact_details));
    all.push(...asArray(g?.contacts));
  });

  const map = new Map();

  all.forEach((item, idx) => {
    const key =
      item?.id != null
        ? `id:${item.id}`
        : `${item?.type || "x"}-${item?.owner_type || "x"}-${item?.phone_number || item?.value || idx}`;

    if (!map.has(key)) map.set(key, item);
  });

  return Array.from(map.values());
};

const normalizeExistingContact = (contact, ctx) => {
  const rawType = clean(contact?.type);
  const type =
    rawType === "landline"
      ? "landline"
      : rawType === "phone"
        ? "phone"
        : "phone"; // map other legacy to phone if needed

  const split = splitFromFull(
    contact?.full_phone_number ||
      `${clean(contact?.country_code)}${clean(contact?.phone_number)}` ||
      contact?.value,
  );

  let ownerType = clean(contact?.owner_type);

  if (!ownerType) {
    if (contact?.guardian_id) {
      const g = (ctx.guardians || []).find(
        (x) => String(x?.id) === String(contact?.guardian_id),
      );
      ownerType =
        g?.relationship === "father"
          ? "father"
          : g?.relationship === "mother"
            ? "mother"
            : "other";
    } else if (contact?.student_id) {
      ownerType = "student";
    } else if (type === "landline") {
      ownerType = "family";
    } else if (contact?.family_id) {
      ownerType = "relative";
    }
  }

  return {
    id: contact?.id ?? null,
    _cid: contact?.id ? null : makeId(),
    type,
    owner_type: ownerType || (type === "landline" ? "family" : ""),
    owner_name: clean(contact?.owner_name),
    country_code: clean(contact?.country_code) || split.country_code,
    phone_number: clean(contact?.phone_number) || split.phone_number,
    supports_call:
      type === "landline"
        ? false // landline defaults set in backend
        : toBool(contact?.supports_call),
    supports_whatsapp:
      type === "landline" ? false : toBool(contact?.supports_whatsapp),
    supports_sms: type === "landline" ? false : toBool(contact?.supports_sms),
    notes: clean(contact?.notes),
    guardian_id: contact?.guardian_id ?? null,
    student_id: contact?.student_id ?? ctx.studentId ?? null,
    family_id: contact?.family_id ?? ctx.familyId ?? null,
  };
};

const validateRow = (row, ctx) => {
  const type = clean(row?.type);
  const ownerType = type === "landline" ? "family" : clean(row?.owner_type);
  const notes = clean(row?.notes);

  if (!type) return "اختر نوع الرقم";
  if (!clean(row?.phone_number)) return "رقم الهاتف مطلوب";

  if (notes.length > 200) {
    return "الملاحظات يجب ألا تتجاوز 200 محرف";
  }

  if (type === "phone") {
    if (!clean(row?.country_code)) {
      return "الحقل country_code مطلوب عندما يكون الهاتف محمول (phone).";
    }

    if (!ownerType) {
      return "اختر مالك الرقم";
    }

    if (!row?.supports_call && !row?.supports_whatsapp && !row?.supports_sms) {
      return "يجب تحديد استخدام واحد على الأقل للرقم (اتصال أو واتساب أو رسائل).";
    }

    if (
      (ownerType === "father" || ownerType === "mother") &&
      !resolveGuardianIdByOwnerType(ownerType, ctx.father, ctx.mother)
    ) {
      return "يجب إرسال معرف ولي الأمر (guardian_id) عندما يكون المالك أب أو أم.";
    }

    if (ownerType === "student" && !ctx.studentId) {
      return "لا يوجد student_id صالح لربط الرقم بالطالب.";
    }

    if (FAMILY_BASED_OWNER_TYPES.has(ownerType) && !ctx.familyId) {
      return "يجب إرسال family_id عند اختيار هذا النوع من المالك.";
    }
  }

  if (type === "landline") {
    if (!ctx.familyId) {
      return "يجب ربط الهاتف الأرضي بعائلة (family_id).";
    }
  }

  return "";
};

const buildPayload = (row, ctx) => {
  const type = clean(row.type);
  const ownerType = type === "landline" ? "family" : clean(row.owner_type);

  const payload = {
    type,
    phone_number: clean(row.phone_number),
    notes: clean(row.notes) || null,
  };

  if (type === "phone") {
    payload.country_code = clean(row.country_code);
    payload.owner_type = ownerType;
    payload.supports_call = !!row.supports_call;
    payload.supports_whatsapp = !!row.supports_whatsapp;
    payload.supports_sms = !!row.supports_sms;

    if (ownerType === "father" || ownerType === "mother") {
      const guardianId = resolveGuardianIdByOwnerType(
        ownerType,
        ctx.father,
        ctx.mother,
      );
      payload.guardian_id = Number(guardianId);
    } else if (ownerType === "student") {
      payload.student_id = Number(ctx.studentId);
    } else if (FAMILY_BASED_OWNER_TYPES.has(ownerType)) {
      payload.family_id = Number(ctx.familyId);
      if (clean(row.owner_name)) payload.owner_name = clean(row.owner_name);
    }
  }

  if (type === "landline") {
    payload.owner_type = "family";
    payload.family_id = Number(ctx.familyId);

    if (clean(row.country_code)) payload.country_code = clean(row.country_code);
    if (clean(row.owner_name)) payload.owner_name = clean(row.owner_name);
  }

  return payload;
};

const ownerDisplay = (row, ctx) => {
  const type = clean(row?.type);
  const ownerType = type === "landline" ? "family" : clean(row?.owner_type);

  if (ownerType === "father")
    return getGuardianDisplayName(ctx.father) || "الأب";
  if (ownerType === "mother")
    return getGuardianDisplayName(ctx.mother) || "الأم";
  if (ownerType === "student") {
    return clean(ctx.studentName) ? `الطالب — ${ctx.studentName}` : "الطالب";
  }

  if (ownerType === "family" || type === "landline") {
    return clean(row?.owner_name)
      ? `العائلة / المنزل — ${clean(row.owner_name)}`
      : "العائلة / المنزل";
  }

  if (FAMILY_BASED_OWNER_TYPES.has(ownerType)) {
    const base = OWNER_LABEL[ownerType] || ownerType;
    return clean(row?.owner_name) ? `${base} — ${clean(row.owner_name)}` : base;
  }

  return "-";
};

const usageBadges = (row) => {
  if (row?.type === "landline") return ["اتصال"];

  return [
    row?.supports_call ? "اتصال" : null,
    row?.supports_whatsapp ? "واتساب" : null,
    row?.supports_sms ? "رسائل" : null,
  ].filter(Boolean);
};

const localRowId = (row) => (row?.id ? `id:${row.id}` : `cid:${row._cid}`);

export default function EditContactsModal({ open, onClose, student, onSaved }) {
  const guardians = student?.family?.guardians || [];
  const father = useMemo(
    () => pickGuardianByRelationship(guardians, "father"),
    [guardians],
  );
  const mother = useMemo(
    () => pickGuardianByRelationship(guardians, "mother"),
    [guardians],
  );

  const studentId = student?.id ?? null;
  const familyId = student?.family_id ?? student?.family?.id ?? null;
  const studentName = clean(student?.full_name);

  // Re-declared without useMemo so it's fresh on every render.
  // We MUST NOT pass this object into any useEffect dependencies to avoid infinite loops.
  const ctx = {
    guardians,
    father,
    mother,
    studentId,
    familyId,
    studentName,
  };

  const [items, setItems] = useState([]);
  const [deletedIds, setDeletedIds] = useState([]);
  const [draft, setDraft] = useState(emptyDraft());

  const [addContact, { isLoading: creating }] = useAddContactMutation();
  const [updateContact, { isLoading: updating }] = useUpdateContactMutation();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();

  const isSaving = creating || updating || deleting;

  useEffect(() => {
    if (!open) return;

    const collected = collectExistingContacts(student).map((c) =>
      normalizeExistingContact(c, ctx),
    );

    setItems(collected);
    setDeletedIds([]);
    setDraft(emptyDraft());
  }, [
    open,
    student,
    studentId,
    familyId,
    studentName,
    // we purposefully omit complex objects like `guardians`, `father`, `mother` from deps to avoid infinite loop
    // or stringify them if we absolutely needed to
  ]);

  /* check SMS constraint */
  const hasSmsContact = useMemo(() => {
    return items.some((x) => x.type === "phone" && x.supports_sms && localRowId(x) !== localRowId(draft));
  }, [items, draft]);

  const ownerOptions = useMemo(
    () =>
      getOwnerOptions({
        type: draft.type,
        father,
        mother,
        studentId,
        familyId,
      }),
    [draft.type, father, mother, studentId, familyId],
  );

  const resetDraft = () => setDraft(emptyDraft());

  const editItem = (it) => {
    setDraft({
      id: it.id ?? null,
      _cid: it._cid ?? null,
      type: it.type ?? "",
      owner_type: it.owner_type ?? "",
      owner_name: it.owner_name ?? "",
      country_code: it.country_code ?? "",
      phone_number: it.phone_number ?? "",
      supports_call: !!it.supports_call,
      supports_whatsapp: !!it.supports_whatsapp,
      supports_sms: !!it.supports_sms,
      notes: it.notes ?? "",
    });
  };

  const addOrUpdateItem = () => {
    const err = validateRow(draft, ctx);
    if (err) {
      notify.error(err, "تحقق من البيانات");
      return;
    }

    const row = normalizeExistingContact(
      {
        ...buildPayload(draft, ctx),
        id: draft.id ?? null,
        _cid: draft._cid || makeId(),
      },
      ctx,
    );

    setItems((prev) => {
      let next = [...prev];
      const currentId = localRowId(row);
      const exists = next.some((it) => localRowId(it) === currentId);

      if (exists) {
        next = next.map((it) => (localRowId(it) === currentId ? row : it));
      } else {
        next.push(row);
      }

      return next;
    });

    resetDraft();
  };

  const removeItem = (it) => {
    if (it?.id) {
      setDeletedIds((prev) => (prev.includes(it.id) ? prev : [...prev, it.id]));
    }

    setItems((prev) => prev.filter((x) => localRowId(x) !== localRowId(it)));

    if (localRowId(draft) === localRowId(it)) {
      resetDraft();
    }
  };

  const handleSave = async () => {
    try {
      for (const it of items) {
        const err = validateRow(it, ctx);
        if (err) {
          notify.error(err, "تحقق من البيانات قبل الحفظ");
          return;
        }
      }

      for (const id of deletedIds) {
        await deleteContact(id).unwrap();
      }

      for (const it of items) {
        const payload = buildPayload(it, ctx);

        if (it.id) {
          await updateContact({ id: it.id, ...payload }).unwrap();
        } else {
          await addContact(payload).unwrap();
        }
      }

      notify.success("تم حفظ معلومات التواصل");
      await onSaved?.();
      onClose?.();
    } catch (e) {
      notify.error(e?.data?.message || e?.message || "فشل حفظ معلومات التواصل");
      console.error(e);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
      <div className="w-full max-w-[560px] bg-white h-full flex flex-col">
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[#6F013F] font-semibold">
              تعديل معلومات التواصل
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {student?.full_name ?? ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {draft?.id || draft?._cid
                  ? "تعديل وسيلة تواصل"
                  : "إضافة وسيلة تواصل"}
              </p>
              <p className="text-xs text-gray-500">
                الهاتف المحمول يحتاج مالكاً واضحاً واستعمالاً واحداً على الأقل،
                والهاتف الأرضي يُربط بالعائلة فقط.
              </p>
            </div>

            <SearchableSelect
              label="نوع الرقم"
              value={draft.type}
              onChange={(v) =>
                setDraft((d) => ({
                  ...emptyDraft(),
                  id: d.id ?? null,
                  _cid: d._cid ?? null,
                  type: v,
                  owner_type: v === "landline" ? "family" : "",
                  country_code: v === "landline" ? "021" : "+963",
                  supports_call: false,
                  supports_whatsapp: false,
                  supports_sms: false,
                  notes: d.notes || "",
                }))
              }
              options={TYPE_OPTIONS}
              placeholder="اختر نوع الرقم"
              allowClear
            />

            {draft.type ? (
              draft.type === "landline" ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  الهاتف الأرضي يُربط بالعائلة تلقائياً، والـ Backend سيجعل
                  الاتصال مفعلاً ويمنع جعله رقماً أساسياً.
                </div>
              ) : (
                <SearchableSelect
                  label="مالك الرقم"
                  value={draft.owner_type}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      owner_type: v,
                      owner_name: FAMILY_BASED_OWNER_TYPES.has(v)
                        ? d.owner_name
                        : "",
                    }))
                  }
                  options={ownerOptions}
                  placeholder="اختر المالك"
                  allowClear
                />
              )
            ) : null}

            {(draft.type === "phone" &&
              FAMILY_BASED_OWNER_TYPES.has(draft.owner_type)) ||
            draft.type === "landline" ? (
              <InputField
                label="اسم توضيحي (اختياري)"
                placeholder={
                  draft.type === "landline"
                    ? "مثال: منزل العائلة"
                    : "مثال: الأخ الأكبر / أبو زيد"
                }
                value={draft.owner_name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, owner_name: e.target.value }))
                }
              />
            ) : null}

            {draft.type === "phone" ? (
              <PhoneInputSplit
                countryCode={draft.country_code}
                phoneNumber={draft.phone_number}
                onChange={({ country_code, phone_number }) =>
                  setDraft((d) => ({ ...d, country_code, phone_number }))
                }
              />
            ) : draft.type === "landline" ? (
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
                    value={draft.phone_number}
                    onChange={(e) => setDraft((d) => ({ ...d, phone_number: e.target.value }))}
                  />
                </div>
              </div>
            ) : null}

            {draft.type === "phone" ? (
              <div className="border border-gray-100 bg-gray-50/50 p-3 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  استخدامات الرقم (يجب تحديد خيار واحد على الأقل)
                </p>
                <div className="flex gap-4">
                  <Checkbox
                    label="اتصال"
                    checked={draft.supports_call}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        supports_call: e.target.checked,
                      }))
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
                    label={hasSmsContact ? "الرسائل النصية (مضاف رقم مسبقاً)" : "رسائل نصية (SMS)"}
                    labelClassName={`text-xs ${hasSmsContact ? "text-gray-400" : "text-gray-700"}`}
                    disabled={hasSmsContact}
                    checked={draft.supports_sms}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        supports_sms: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}

            <InputField
              label="ملاحظات (اختياري)"
              placeholder="200 محرف كحد أقصى"
              value={draft.notes}
              onChange={(e) => {
                const v = e.target.value;
                if (String(v).length > 200) return;
                setDraft((d) => ({ ...d, notes: v }));
              }}
              error=""
            />

            <div className="flex items-center gap-2 justify-end">
              {draft?.id || draft?._cid ? (
                <button
                  type="button"
                  onClick={resetDraft}
                  className="text-sm px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  إلغاء
                </button>
              ) : null}

              <GradientButton
                type="button"
                onClick={addOrUpdateItem}
                disabled={!!validateRow(draft, ctx)}
                className="py-2"
              >
                {draft?.id || draft?._cid ? "تحديث الرقم" : "إضافة الرقم"}
              </GradientButton>
            </div>
          </div>

          <div className="space-y-2 pb-4">
            {items.length === 0 ? (
              <p className="text-xs text-gray-500">
                لا يوجد وسائل تواصل حالياً.
              </p>
            ) : (
              items.map((it, idx) => (
                <div
                  key={localRowId(it) || idx}
                  className="border border-gray-200 rounded-2xl p-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-800">
                      {ownerDisplay(it, ctx)}
                    </p>

                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      <span>النوع: {it.type === "landline" ? "أرضي" : "محمول"}</span>
                      {it.type === "phone" && (
                        <span className="flex gap-1">
                          [
                          {it.supports_call ? "اتصال" : ""}
                          {it.supports_call && (it.supports_whatsapp || it.supports_sms) ? " | " : ""}
                          {it.supports_whatsapp ? "واتساب" : ""}
                          {it.supports_whatsapp && it.supports_sms ? " | " : ""}
                          {it.supports_sms ? "رسائل" : ""}
                          ]
                        </span>
                      )}
                    </p>

                    <p className="text-xs text-gray-600" dir="ltr" style={{ textAlign: "right" }}>
                      {it.country_code ? `${it.country_code} ` : ""}
                      {it.phone_number}
                    </p>

                    {it.notes ? (
                      <p className="text-xs text-gray-500">
                        ملاحظات: {it.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editItem(it)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(it)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="حذف"
                      disabled={isSaving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            إغلاق
          </button>

          <GradientButton
            type="button"
            onClick={handleSave}
            className="py-2"
            disabled={isSaving}
          >
            حفظ التعديلات
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
