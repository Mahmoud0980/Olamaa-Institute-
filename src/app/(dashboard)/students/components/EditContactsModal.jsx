"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { PhoneNumberUtil } from "google-libphonenumber";

import SearchableSelect from "@/components/common/SearchableSelect";
import InputField from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";

import {
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "@/store/services/contactsApi";

const phoneUtil = PhoneNumberUtil.getInstance();

/* ================= constants ================= */
const TYPE_OPTIONS = [
  { key: "phone", value: "phone", label: "هاتف" },
  { key: "whatsapp", value: "whatsapp", label: "واتساب" },
  { key: "email", value: "email", label: "إيميل" },
];

const normalizePhone = (full) => {
  if (!full) return { country_code: "", phone_number: "" };

  try {
    const parsed = phoneUtil.parse(full);
    const country_code = `+${parsed.getCountryCode()}`;
    const phone_number = parsed.getNationalNumber().toString();
    return { country_code, phone_number };
  } catch {
    // fallback بسيط
    const v = String(full);
    const cc = v.startsWith("+") ? v.match(/^\+\d{1,4}/)?.[0] || "" : "";
    const pn = v.replace(cc, "").replace(/\D/g, "");
    return { country_code: cc, phone_number: pn };
  }
};

const emptyRow = (guardianId) => ({
  id: null,
  guardian_id: guardianId,
  type: "",
  // phone/whatsapp
  country_code: "",
  phone_number: "",
  // email / whatsapp
  value: "",
  notes: "",
  is_primary: false,
  _isNew: true,
});

export default function EditContactsModal({ open, onClose, student, onSaved }) {
  const guardians = student?.family?.guardians || [];
  const father = guardians.find((g) => g.relationship === "father");
  const mother = guardians.find((g) => g.relationship === "mother");

  const [step, setStep] = useState(1);

  const [rowsFather, setRowsFather] = useState([]);
  const [rowsMother, setRowsMother] = useState([]);

  const [addContact, { isLoading: creating }] = useAddContactMutation();
  const [updateContact, { isLoading: updating }] = useUpdateContactMutation();
  const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();
  const isSaving = creating || updating || deleting;

  /* ================= init ================= */
  useEffect(() => {
    if (!open) return;
    setStep(1);

    const mapContact = (c, guardianId) => {
      const { country_code, phone_number } = normalizePhone(
        c?.full_phone_number
      );

      return {
        id: c?.id ?? null,
        guardian_id: guardianId,
        type: c?.type ?? "",
        country_code: country_code || "",
        phone_number: phone_number || "",
        value: c?.value ?? "",
        notes: c?.notes ?? "",
        is_primary: !!c?.is_primary,
        _isNew: false,
      };
    };

    setRowsFather(
      Array.isArray(father?.contact_details)
        ? father.contact_details.map((c) => mapContact(c, father.id))
        : []
    );

    setRowsMother(
      Array.isArray(mother?.contact_details)
        ? mother.contact_details.map((c) => mapContact(c, mother.id))
        : []
    );
  }, [open, father, mother]);

  if (!open) return null;

  /* ================= helpers ================= */
  const rows = step === 1 ? rowsFather : rowsMother;
  const setRows = step === 1 ? setRowsFather : setRowsMother;
  const guardian = step === 1 ? father : mother;

  const addRow = () => {
    if (!guardian?.id) return;
    setRows((p) => [...p, emptyRow(guardian.id)]);
  };

  const updateRow = (idx, patch) => {
    setRows((p) => p.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = async (row, idx) => {
    try {
      if (row?.id) {
        await deleteContact(row.id).unwrap();
      }
      setRows((p) => p.filter((_, i) => i !== idx));
      toast.success("تم حذف وسيلة التواصل");
    } catch (e) {
      toast.error(e?.data?.message || "فشل الحذف");
    }
  };

  const validateRow = (r) => {
    if (!r.type) return "نوع الاتصال مطلوب";

    if (r.type === "email") {
      if (!r.value) return "البريد الإلكتروني مطلوب";
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.value);
      if (!ok) return "البريد الإلكتروني غير صحيح";
      return "";
    }

    // phone / whatsapp
    if (!r.country_code || !r.phone_number) return "رقم الهاتف مطلوب";
    return "";
  };

  const buildPayload = (r) => {
    // أساسيات مشتركة
    const base = {
      guardian_id: Number(r.guardian_id),
      type: r.type,
      is_primary: !!r.is_primary,
      notes: r.notes || null,
    };

    if (r.type === "email") {
      // بعض الباكند بدو address، وبعضه value
      return {
        ...base,
        value: r.value,
        address: r.value,
      };
    }

    // phone / whatsapp
    // swagger عندك: phone => country_code + phone_number
    // whatsapp => value (+ ممكن country_code + phone_number)
    const full = `${r.country_code}${r.phone_number}`;

    return {
      ...base,
      country_code: r.country_code,
      phone_number: r.phone_number,
      value: r.type === "whatsapp" ? r.phone_number : r.phone_number,
      full_phone_number: full, // إذا الباكند بيخزنها
    };
  };

  const saveAll = async (rowsList) => {
    for (const r of rowsList) {
      const err = validateRow(r);
      if (err) {
        toast.error(err);
        throw new Error(err);
      }

      const payload = buildPayload(r);

      if (r._isNew) {
        await addContact(payload).unwrap();
      } else {
        await updateContact({ id: r.id, ...payload }).unwrap();
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveAll(rowsFather);
      await saveAll(rowsMother);

      toast.success("تم حفظ معلومات التواصل");
      onSaved?.();
      onClose?.();
    } catch (e) {
      if (e?.data?.message) toast.error(e.data.message);
      console.error(e);
    }
  };

  /* ================= UI labels ================= */
  const title = step === 1 ? "وسائل تواصل الأب" : "وسائل تواصل الأم";

  /* ================= render ================= */
  return (
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
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#6F013F]">
              {title}
            </span>
            <button
              onClick={addRow}
              className="text-sm px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              + إضافة
            </button>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-gray-400">لا يوجد بيانات.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((r, idx) => (
                <div
                  key={r.id ?? `new-${idx}`}
                  className="bg-gray-50 rounded-2xl p-4 space-y-3"
                >
                  {/* type */}
                  <SearchableSelect
                    label="النوع"
                    value={r.type}
                    onChange={(v) =>
                      updateRow(idx, {
                        type: v,
                        value: "",
                        country_code: "",
                        phone_number: "",
                      })
                    }
                    options={TYPE_OPTIONS}
                    placeholder="اختر النوع"
                    allowClear
                  />

                  {/* phone / whatsapp */}
                  {(r.type === "phone" || r.type === "whatsapp") && (
                    <PhoneInputSplit
                      label={
                        r.type === "whatsapp" ? "رقم واتساب" : "رقم الهاتف"
                      }
                      countryCode={r.country_code}
                      phoneNumber={r.phone_number}
                      onChange={({ country_code, phone_number }) =>
                        updateRow(idx, {
                          country_code,
                          phone_number,
                          // لو النوع whatsapp نخزن value كمان لتطابق swagger
                          value: r.type === "whatsapp" ? phone_number : r.value,
                        })
                      }
                    />
                  )}

                  {/* email */}
                  {r.type === "email" && (
                    <InputField
                      label="البريد الإلكتروني"
                      type="email"
                      value={r.value}
                      onChange={(e) =>
                        updateRow(idx, { value: e.target.value })
                      }
                    />
                  )}

                  {/* notes */}
                  <InputField
                    label="ملاحظات"
                    value={r.notes || ""}
                    onChange={(e) => updateRow(idx, { notes: e.target.value })}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-[#6F013F]"
                        checked={!!r.is_primary}
                        onChange={(e) =>
                          updateRow(idx, { is_primary: e.target.checked })
                        }
                      />
                      أساسي
                    </label>

                    <button
                      onClick={() => removeRow(r, idx)}
                      className="text-red-500 hover:text-red-700"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
  );
}
