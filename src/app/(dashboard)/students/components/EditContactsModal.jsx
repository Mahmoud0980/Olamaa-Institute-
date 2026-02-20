"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import InputField from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";
import GradientButton from "@/components/common/GradientButton";

import {
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "@/store/services/contactsApi";

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

/* ===== split full phone to cc/pn ===== */
const splitFromFull = (full) => {
  const v = clean(full);
  if (!v) return { country_code: "", phone_number: "" };

  // +963981644243 => +963 / 981644243
  const m = v.match(/^(\+\d{1,4})(\d+)$/);
  if (m) return { country_code: m[1], phone_number: m[2] };

  // fallback
  const cc = v.startsWith("+") ? v.match(/^\+\d{1,4}/)?.[0] || "" : "";
  const pn = v.replace(cc, "").replace(/\D/g, "");
  return { country_code: cc, phone_number: pn };
};

const emptyDraft = (guardianId = "") => ({
  id: null,
  guardian_id: guardianId ? String(guardianId) : "",
  type: "",
  country_code: "",
  phone_number: "",
  full_phone_number: "",
  value: "",
  notes: "",
  is_primary: false,
  _isNew: true,
});

const toLocalContact = (c, guardianId) => ({
  id: c?.id ?? null,
  guardian_id: guardianId,
  type: c?.type ?? "",
  country_code: c?.country_code ?? "",
  phone_number: c?.phone_number ?? "",
  full_phone_number: c?.full_phone_number ?? "",
  value: c?.value ?? c?.address ?? "",
  notes: c?.notes ?? "",
  is_primary: !!c?.is_primary,
  _isNew: false,
});

// contact_details ممكن تكون Array أو {data:[...]}
const pickContacts = (guardian) => {
  const cd = guardian?.contact_details;
  if (Array.isArray(cd?.data)) return cd.data;
  if (Array.isArray(cd)) return cd;
  return [];
};

export default function EditContactsModal({ open, onClose, student, onSaved }) {
  const guardians = student?.family?.guardians || [];
  const father = guardians.find((g) => g.relationship === "father");
  const mother = guardians.find((g) => g.relationship === "mother");

  const [step, setStep] = useState(1);

  const [itemsFather, setItemsFather] = useState([]);
  const [itemsMother, setItemsMother] = useState([]);

  const [draftFather, setDraftFather] = useState(emptyDraft());
  const [draftMother, setDraftMother] = useState(emptyDraft());

  const [addContact, { isLoading: creating }] = useAddContactMutation();
  const [updateContact, { isLoading: updating }] = useUpdateContactMutation();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();
  const isSaving = creating || updating || deleting;

  /* ================= init ================= */
  useEffect(() => {
    if (!open) return;

    setStep(1);

    const fatherContacts = father?.id ? pickContacts(father) : [];
    const motherContacts = mother?.id ? pickContacts(mother) : [];

    setItemsFather(
      father?.id ? fatherContacts.map((c) => toLocalContact(c, father.id)) : [],
    );
    setItemsMother(
      mother?.id ? motherContacts.map((c) => toLocalContact(c, mother.id)) : [],
    );

    setDraftFather(emptyDraft(father?.id));
    setDraftMother(emptyDraft(mother?.id));
  }, [open, father?.id, mother?.id]);

  /* ================= pick current ================= */
  const items = step === 1 ? itemsFather : itemsMother;
  const setItems = step === 1 ? setItemsFather : setItemsMother;

  const draft = step === 1 ? draftFather : draftMother;
  const setDraft = step === 1 ? setDraftFather : setDraftMother;

  const guardian = step === 1 ? father : mother;

  /* ================= UI helpers ================= */
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

  const displayPhone = (it) =>
    clean(it.full_phone_number) ||
    `${clean(it.country_code)} ${clean(it.phone_number)}`.trim() ||
    clean(it.value) ||
    "-";

  /* ================= derived (Primary phone) ================= */
  const hasPhonePrimary = useMemo(
    () => items.some((x) => x.type === "phone" && x.is_primary),
    [items],
  );

  const phonePrimaryOwner = useMemo(() => {
    const it = items.find((x) => x.type === "phone" && x.is_primary);
    return it?.guardian_id ? String(it.guardian_id) : null;
  }, [items]);

  const showPrimaryCheckbox =
    !!draft.type &&
    (draft.type === "whatsapp" ||
      (draft.type === "phone" &&
        (!hasPhonePrimary ||
          (draft.type === "phone" && draft.id && draft.is_primary))));

  const primaryHint =
    draft.type === "phone" && hasPhonePrimary && !draft.is_primary
      ? `هناك رقم هاتف أساسي محدد مسبقًا (${guardianName(
          phonePrimaryOwner,
        )}). لا يمكن تحديد رقم هاتف أساسي آخر.`
      : "";

  /* ================= validation ================= */
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v));

  const canAdd = () => {
    if (!guardian?.id) return false;
    if (!draft.type) return false;

    if (clean(draft.notes).length > 200) return false;

    if (draft.type === "email") {
      const v = clean(draft.value);
      if (!v) return false;
      if (!isValidEmail(v)) return false;
      return true;
    }

    if (draft.type === "phone" || draft.type === "whatsapp") {
      if (!clean(draft.country_code)) return false;
      if (!clean(draft.phone_number)) return false;
      return true;
    }

    return false;
  };

  const normalizePhoneRow = (it) => {
    if (it.type !== "phone" && it.type !== "whatsapp") return it;

    const cc = clean(it.country_code);
    const pn = clean(it.phone_number);
    if (cc && pn) return it;

    const from = clean(it.full_phone_number) || clean(it.value);
    const sp = splitFromFull(from);

    const next = {
      ...it,
      country_code: cc || sp.country_code,
      phone_number: pn || sp.phone_number,
    };

    next.full_phone_number =
      clean(next.country_code) && clean(next.phone_number)
        ? `${clean(next.country_code)}${clean(next.phone_number)}`
        : clean(it.full_phone_number);

    // توافق: خلي value للواتساب/الهاتف هو الرقم
    next.value = clean(next.phone_number) || clean(next.value);

    return next;
  };

  const buildPayload = (row) => {
    const base = {
      guardian_id: Number(row.guardian_id),
      type: row.type,
      is_primary: !!row.is_primary,
      notes: clean(row.notes) || null,
    };

    if (row.type === "email") {
      const v = clean(row.value);
      return { ...base, value: v, address: v };
    }

    // phone / whatsapp
    const cc = clean(row.country_code);
    const pn = clean(row.phone_number);

    return {
      ...base,
      country_code: cc,
      phone_number: pn,
      value: pn, // swagger: whatsapp يحتاج value، phone كمان ما بتضر
    };
  };

  /* ================= actions ================= */
  const resetDraft = () => setDraft(emptyDraft(guardian?.id));

  const addOrUpdateItem = () => {
    if (!canAdd()) {
      notify.error("يرجى تعبئة الحقول المطلوبة بشكل صحيح", "تحقق من البيانات");
      return;
    }

    // منع phone primary مكرر
    const wantsPhonePrimary = draft.type === "phone" && !!draft.is_primary;
    if (wantsPhonePrimary) {
      const otherPrimary = items.find(
        (x) => x.type === "phone" && x.is_primary && x.id !== draft.id,
      );
      if (otherPrimary) {
        notify.error(
          "مسموح رقم هاتف واحد فقط كجهة اتصال أساسية (Primary)",
          "تنبيه",
        );
        return;
      }
    }

    let normalized = {
      id: draft.id ?? null,
      guardian_id: guardian?.id,
      type: draft.type,
      country_code: clean(draft.country_code),
      phone_number: clean(draft.phone_number),
      full_phone_number:
        clean(draft.country_code) && clean(draft.phone_number)
          ? `${clean(draft.country_code)}${clean(draft.phone_number)}`
          : "",
      value: clean(draft.value) || "",
      notes: clean(draft.notes) || "",
      is_primary: !!draft.is_primary,
      _isNew: !draft.id,
    };

    // توافق: value للواتساب/الهاتف
    if (normalized.type === "whatsapp" || normalized.type === "phone") {
      normalized.value = normalized.phone_number;
    }

    // تأكيد normalization (لو full موجود بس حقول ناقصة)
    normalized = normalizePhoneRow(normalized);
    setItems((prev) => {
      // تعديل محلي
      if (normalized.id) {
        return prev.map((x) => (x.id === normalized.id ? normalized : x));
      }

      // ✅ إضافة محلية فورية (حتى قبل الحفظ)
      return [...prev, { ...normalized, _cid: crypto.randomUUID() }];
    });

    resetDraft();
  };

  const editItem = (it) => {
    setDraft({
      id: it.id ?? null,
      guardian_id: String(it.guardian_id ?? guardian?.id ?? ""),
      type: it.type ?? "",
      country_code: it.country_code ?? "",
      phone_number: it.phone_number ?? "",
      full_phone_number: it.full_phone_number ?? "",
      value: it.value ?? "",
      notes: it.notes ?? "",
      is_primary: !!it.is_primary,
      _isNew: !it.id,
    });
  };

  const removeItem = async (it) => {
    try {
      if (it?.id) {
        await deleteContact(it.id).unwrap();
      }
      setItems((p) => p.filter((x) => (it?.id ? x.id !== it.id : x !== it)));
      notify.success("تم حذف وسيلة التواصل");
      if (draft?.id && it?.id && draft.id === it.id) resetDraft();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الحذف");
    }
  };

  const validateRow = (it, whoLabel, idx) => {
    if (!it.type) return `(${whoLabel}) صف #${idx + 1}: نوع الاتصال مطلوب`;

    if (it.type === "email") {
      const v = clean(it.value);
      if (!v) return `(${whoLabel}) صف #${idx + 1}: البريد الإلكتروني مطلوب`;
      if (!isValidEmail(v))
        return `(${whoLabel}) صف #${idx + 1}: البريد الإلكتروني غير صحيح`;
      return "";
    }

    if (it.type === "phone" || it.type === "whatsapp") {
      const cc = clean(it.country_code);
      const pn = clean(it.phone_number);
      if (!cc || !pn) {
        return `(${whoLabel}) صف #${idx + 1}: رقم الهاتف مطلوب`;
      }
      return "";
    }

    return "";
  };

  const saveAllForGuardian = async (list, whoLabel) => {
    // Normalize أولاً
    const fixed = list.map(normalizePhoneRow);

    // تحقق Primary phone واحد فقط
    const primaries = fixed.filter((x) => x.type === "phone" && x.is_primary);
    if (primaries.length > 1) {
      throw new Error(`(${whoLabel}) مسموح رقم هاتف واحد فقط كـ Primary`);
    }

    // ✅ تجاهل الصفوف الناقصة بدل ما توقف الحفظ كله
    const validRows = [];
    for (let i = 0; i < fixed.length; i++) {
      const err = validateRow(fixed[i], whoLabel, i);
      if (err) {
        // إذا بدك توقف مباشرة بدل التجاهل، استبدل السطرين الجايين بـ: throw new Error(err)
        notify.error(err);
        continue;
      }
      validRows.push(fixed[i]);
    }

    // ما في صفوف صالحة
    if (!validRows.length) return;

    for (const it of validRows) {
      const payload = buildPayload(it);

      if (it.id) {
        setItems((prev) =>
          prev.map((x) => (x.id === it.id ? { ...x, ...it } : x)),
        );

        await updateContact({ id: it.id, ...payload }).unwrap();
      } else {
        const res = await addContact(payload).unwrap();

        // إذا السيرفر رجّع عنصر
        const created = res?.data;

        // ✅ بدّل العنصر المحلي الجديد (اللي ما معه id) بعنصر معه id
        if (created?.id) {
          setItems((prev) =>
            prev.map((x) =>
              x._cid === it._cid ? { ...x, id: created.id, _isNew: false } : x,
            ),
          );
        } else {
          // حتى لو السيرفر رجع nulls، على الأقل اعتبره محفوظ
          setItems((prev) =>
            prev.map((x) => (x._cid === it._cid ? { ...x, _isNew: false } : x)),
          );
        }
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveAllForGuardian(itemsFather, "الأب");
      await saveAllForGuardian(itemsMother, "الأم");

      notify.success("تم حفظ معلومات التواصل");
      await onSaved?.(); // ✅ إذا onSaved refetch
      onClose?.();
    } catch (e) {
      notify.error(e?.message || e?.data?.message || "فشل الحفظ");
      console.error(e);
    }
  };

  /* ================= UI ================= */
  const title = step === 1 ? "معلومات تواصل الأب" : "معلومات تواصل الأم";

  return open ? (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
      <div className="w-[520px] bg-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <h3 className="text-[#6F013F] font-semibold text-sm">{title}</h3>

          {/* add/edit */}
          <div className="space-y-3 border border-gray-200 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700">
              {draft?.id ? "تعديل جهة تواصل" : "إضافة جهة تواصل"}
            </p>

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
                  full_phone_number: "",
                  value: "",
                  notes: d.notes || "",
                  is_primary: false,
                }))
              }
              options={TYPE_OPTIONS}
              placeholder="اختر النوع"
              allowClear
            />

            {(draft.type === "phone" || draft.type === "whatsapp") && (
              <PhoneInputSplit
                label={draft.type === "whatsapp" ? "رقم واتساب" : "رقم الهاتف"}
                countryCode={draft.country_code}
                phoneNumber={draft.phone_number}
                onChange={({ country_code, phone_number }) =>
                  setDraft((d) => ({
                    ...d,
                    country_code,
                    phone_number,
                    full_phone_number:
                      clean(country_code) && clean(phone_number)
                        ? `${clean(country_code)}${clean(phone_number)}`
                        : "",
                    value:
                      d.type === "whatsapp" || d.type === "phone"
                        ? phone_number
                        : d.value,
                  }))
                }
              />
            )}

            {draft.type === "email" && (
              <InputField
                label="البريد الإلكتروني"
                required
                type="email"
                value={draft.value}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, value: e.target.value }))
                }
              />
            )}

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

            <div className="flex items-center gap-2 justify-end">
              {draft?.id ? (
                <button
                  type="button"
                  onClick={resetDraft}
                  className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  إلغاء التعديل
                </button>
              ) : null}

              <GradientButton
                type="button"
                onClick={addOrUpdateItem}
                disabled={!canAdd()}
                className="py-2"
              >
                {draft?.id ? "تحديث" : "إضافة"}
              </GradientButton>
            </div>
          </div>

          {/* list */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-xs text-gray-500">لا يوجد بيانات تواصل.</p>
            ) : (
              items.map((it, idx) => (
                <div
                  key={it.id ?? `new-${idx}`}
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
                      <p className="text-xs text-gray-600">
                        الإيميل: {it.value}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600">
                        الرقم: {displayPhone(it)}
                      </p>
                    )}

                    {it.notes ? (
                      <p className="text-xs text-gray-500">
                        ملاحظات: {it.notes}
                      </p>
                    ) : null}

                    {it.is_primary && (
                      <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-[#6F013F]">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editItem(it)}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(it)}
                      className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
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

        {/* Footer */}
        <div className="px-6 py-4">
          <StepButtonsSmart
            step={step}
            total={2}
            onBack={step === 1 ? onClose : () => setStep(1)}
            onNext={step === 2 ? handleSave : () => setStep(2)}
            submitLabel="حفظ"
            loading={isSaving}
          />
        </div>
      </div>
    </div>
  ) : null;
}
