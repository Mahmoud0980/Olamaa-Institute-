// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { X, Trash2, Pencil } from "lucide-react";
// import { notify } from "@/lib/helpers/toastify";

// import SearchableSelect from "@/components/common/SearchableSelect";
// import InputField from "@/components/common/InputField";
// import StepButtonsSmart from "@/components/common/StepButtonsSmart";
// import PhoneInputSplit from "@/components/common/PhoneInputSplit";
// import GradientButton from "@/components/common/GradientButton";

// import {
//   useAddContactMutation,
//   useUpdateContactMutation,
//   useDeleteContactMutation,
// } from "@/store/services/contactsApi";

// /* ================= constants ================= */
// const TYPE_OPTIONS = [
//   { key: "phone", value: "phone", label: "هاتف" },
//   { key: "whatsapp", value: "whatsapp", label: "واتساب" },
//   { key: "email", value: "email", label: "إيميل" },
// ];

// const TYPE_LABEL = {
//   phone: "هاتف",
//   whatsapp: "واتساب",
//   email: "إيميل",
// };

// const clean = (v) => String(v ?? "").trim();

// /* ===== split full phone to cc/pn ===== */
// const splitFromFull = (full) => {
//   const v = clean(full);
//   if (!v) return { country_code: "", phone_number: "" };

//   // +963981644243 => +963 / 981644243
//   const m = v.match(/^(\+\d{1,4})(\d+)$/);
//   if (m) return { country_code: m[1], phone_number: m[2] };

//   // fallback
//   const cc = v.startsWith("+") ? v.match(/^\+\d{1,4}/)?.[0] || "" : "";
//   const pn = v.replace(cc, "").replace(/\D/g, "");
//   return { country_code: cc, phone_number: pn };
// };

// const emptyDraft = (guardianId = "") => ({
//   id: null,
//   guardian_id: guardianId ? String(guardianId) : "",
//   type: "",
//   country_code: "",
//   phone_number: "",
//   full_phone_number: "",
//   value: "",
//   notes: "",
//   is_primary: false,
//   _isNew: true,
// });

// const toLocalContact = (c, guardianId) => ({
//   id: c?.id ?? null,
//   guardian_id: guardianId,
//   type: c?.type ?? "",
//   country_code: c?.country_code ?? "",
//   phone_number: c?.phone_number ?? "",
//   full_phone_number: c?.full_phone_number ?? "",
//   value: c?.value ?? c?.address ?? "",
//   notes: c?.notes ?? "",
//   is_primary: !!c?.is_primary,
//   _isNew: false,
// });

// // contact_details ممكن تكون Array أو {data:[...]}
// const pickContacts = (guardian) => {
//   const cd = guardian?.contact_details;
//   if (Array.isArray(cd?.data)) return cd.data;
//   if (Array.isArray(cd)) return cd;
//   return [];
// };

// export default function EditContactsModal({ open, onClose, student, onSaved }) {
//   const guardians = student?.family?.guardians || [];
//   const father = guardians.find((g) => g.relationship === "father");
//   const mother = guardians.find((g) => g.relationship === "mother");

//   const [step, setStep] = useState(1);

//   const [itemsFather, setItemsFather] = useState([]);
//   const [itemsMother, setItemsMother] = useState([]);

//   const [draftFather, setDraftFather] = useState(emptyDraft());
//   const [draftMother, setDraftMother] = useState(emptyDraft());

//   const [addContact, { isLoading: creating }] = useAddContactMutation();
//   const [updateContact, { isLoading: updating }] = useUpdateContactMutation();
//   const [deleteContact, { isLoading: deleting }] = useDeleteContactMutation();
//   const isSaving = creating || updating || deleting;

//   /* ================= init ================= */
//   useEffect(() => {
//     if (!open) return;

//     setStep(1);

//     const fatherContacts = father?.id ? pickContacts(father) : [];
//     const motherContacts = mother?.id ? pickContacts(mother) : [];

//     setItemsFather(
//       father?.id ? fatherContacts.map((c) => toLocalContact(c, father.id)) : [],
//     );
//     setItemsMother(
//       mother?.id ? motherContacts.map((c) => toLocalContact(c, mother.id)) : [],
//     );

//     setDraftFather(emptyDraft(father?.id));
//     setDraftMother(emptyDraft(mother?.id));
//   }, [open, father?.id, mother?.id]);

//   /* ================= pick current ================= */
//   const items = step === 1 ? itemsFather : itemsMother;
//   const setItems = step === 1 ? setItemsFather : setItemsMother;

//   const draft = step === 1 ? draftFather : draftMother;
//   const setDraft = step === 1 ? setDraftFather : setDraftMother;

//   const guardian = step === 1 ? father : mother;

//   /* ================= UI helpers ================= */
//   const guardianName = (gid) => {
//     const g = guardians.find((x) => String(x?.id) === String(gid));
//     if (!g) return `#${gid}`;
//     const full =
//       g?.full_name ||
//       `${g?.first_name ?? ""} ${g?.last_name ?? ""}`.trim() ||
//       `#${gid}`;
//     const rel =
//       g?.relationship === "father"
//         ? "الأب"
//         : g?.relationship === "mother"
//           ? "الأم"
//           : "";
//     return rel ? `${rel} — ${full}` : full;
//   };

//   const displayPhone = (it) =>
//     clean(it.full_phone_number) ||
//     `${clean(it.country_code)} ${clean(it.phone_number)}`.trim() ||
//     clean(it.value) ||
//     "-";

//   /* ================= derived (Primary phone) ================= */
//   const hasPhonePrimary = useMemo(
//     () => items.some((x) => x.type === "phone" && x.is_primary),
//     [items],
//   );

//   const phonePrimaryOwner = useMemo(() => {
//     const it = items.find((x) => x.type === "phone" && x.is_primary);
//     return it?.guardian_id ? String(it.guardian_id) : null;
//   }, [items]);

//   const showPrimaryCheckbox =
//     !!draft.type &&
//     (draft.type === "whatsapp" ||
//       (draft.type === "phone" &&
//         (!hasPhonePrimary ||
//           (draft.type === "phone" && draft.id && draft.is_primary))));

//   const primaryHint =
//     draft.type === "phone" && hasPhonePrimary && !draft.is_primary
//       ? `هناك رقم هاتف أساسي محدد مسبقًا (${guardianName(
//           phonePrimaryOwner,
//         )}). لا يمكن تحديد رقم هاتف أساسي آخر.`
//       : "";

//   /* ================= validation ================= */
//   const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(v));

//   const canAdd = () => {
//     if (!guardian?.id) return false;
//     if (!draft.type) return false;

//     if (clean(draft.notes).length > 200) return false;

//     if (draft.type === "email") {
//       const v = clean(draft.value);
//       if (!v) return false;
//       if (!isValidEmail(v)) return false;
//       return true;
//     }

//     if (draft.type === "phone" || draft.type === "whatsapp") {
//       if (!clean(draft.country_code)) return false;
//       if (!clean(draft.phone_number)) return false;
//       return true;
//     }

//     return false;
//   };

//   const normalizePhoneRow = (it) => {
//     if (it.type !== "phone" && it.type !== "whatsapp") return it;

//     const cc = clean(it.country_code);
//     const pn = clean(it.phone_number);
//     if (cc && pn) return it;

//     const from = clean(it.full_phone_number) || clean(it.value);
//     const sp = splitFromFull(from);

//     const next = {
//       ...it,
//       country_code: cc || sp.country_code,
//       phone_number: pn || sp.phone_number,
//     };

//     next.full_phone_number =
//       clean(next.country_code) && clean(next.phone_number)
//         ? `${clean(next.country_code)}${clean(next.phone_number)}`
//         : clean(it.full_phone_number);

//     // توافق: خلي value للواتساب/الهاتف هو الرقم
//     next.value = clean(next.phone_number) || clean(next.value);

//     return next;
//   };

//   const buildPayload = (row) => {
//     const base = {
//       guardian_id: Number(row.guardian_id),
//       type: row.type,
//       is_primary: !!row.is_primary,
//       notes: clean(row.notes) || null,
//     };

//     if (row.type === "email") {
//       const v = clean(row.value);
//       return { ...base, value: v, address: v };
//     }

//     // phone / whatsapp
//     const cc = clean(row.country_code);
//     const pn = clean(row.phone_number);

//     return {
//       ...base,
//       country_code: cc,
//       phone_number: pn,
//       value: pn, // swagger: whatsapp يحتاج value، phone كمان ما بتضر
//     };
//   };

//   /* ================= actions ================= */
//   const resetDraft = () => setDraft(emptyDraft(guardian?.id));

//   const addOrUpdateItem = () => {
//     if (!canAdd()) {
//       notify.error("يرجى تعبئة الحقول المطلوبة بشكل صحيح", "تحقق من البيانات");
//       return;
//     }

//     // منع phone primary مكرر
//     const wantsPhonePrimary = draft.type === "phone" && !!draft.is_primary;
//     if (wantsPhonePrimary) {
//       const otherPrimary = items.find(
//         (x) => x.type === "phone" && x.is_primary && x.id !== draft.id,
//       );
//       if (otherPrimary) {
//         notify.error(
//           "مسموح رقم هاتف واحد فقط كجهة اتصال أساسية (Primary)",
//           "تنبيه",
//         );
//         return;
//       }
//     }

//     let normalized = {
//       id: draft.id ?? null,
//       guardian_id: guardian?.id,
//       type: draft.type,
//       country_code: clean(draft.country_code),
//       phone_number: clean(draft.phone_number),
//       full_phone_number:
//         clean(draft.country_code) && clean(draft.phone_number)
//           ? `${clean(draft.country_code)}${clean(draft.phone_number)}`
//           : "",
//       value: clean(draft.value) || "",
//       notes: clean(draft.notes) || "",
//       is_primary: !!draft.is_primary,
//       _isNew: !draft.id,
//     };

//     // توافق: value للواتساب/الهاتف
//     if (normalized.type === "whatsapp" || normalized.type === "phone") {
//       normalized.value = normalized.phone_number;
//     }

//     // تأكيد normalization (لو full موجود بس حقول ناقصة)
//     normalized = normalizePhoneRow(normalized);
//     setItems((prev) => {
//       // تعديل محلي
//       if (normalized.id) {
//         return prev.map((x) => (x.id === normalized.id ? normalized : x));
//       }

//       // ✅ إضافة محلية فورية (حتى قبل الحفظ)
//       return [...prev, { ...normalized, _cid: crypto.randomUUID() }];
//     });

//     resetDraft();
//   };

//   const editItem = (it) => {
//     setDraft({
//       id: it.id ?? null,
//       guardian_id: String(it.guardian_id ?? guardian?.id ?? ""),
//       type: it.type ?? "",
//       country_code: it.country_code ?? "",
//       phone_number: it.phone_number ?? "",
//       full_phone_number: it.full_phone_number ?? "",
//       value: it.value ?? "",
//       notes: it.notes ?? "",
//       is_primary: !!it.is_primary,
//       _isNew: !it.id,
//     });
//   };

//   const removeItem = async (it) => {
//     try {
//       if (it?.id) {
//         await deleteContact(it.id).unwrap();
//       }
//       setItems((p) => p.filter((x) => (it?.id ? x.id !== it.id : x !== it)));
//       notify.success("تم حذف وسيلة التواصل");
//       if (draft?.id && it?.id && draft.id === it.id) resetDraft();
//     } catch (e) {
//       notify.error(e?.data?.message || "فشل الحذف");
//     }
//   };

//   const validateRow = (it, whoLabel, idx) => {
//     if (!it.type) return `(${whoLabel}) صف #${idx + 1}: نوع الاتصال مطلوب`;

//     if (it.type === "email") {
//       const v = clean(it.value);
//       if (!v) return `(${whoLabel}) صف #${idx + 1}: البريد الإلكتروني مطلوب`;
//       if (!isValidEmail(v))
//         return `(${whoLabel}) صف #${idx + 1}: البريد الإلكتروني غير صحيح`;
//       return "";
//     }

//     if (it.type === "phone" || it.type === "whatsapp") {
//       const cc = clean(it.country_code);
//       const pn = clean(it.phone_number);
//       if (!cc || !pn) {
//         return `(${whoLabel}) صف #${idx + 1}: رقم الهاتف مطلوب`;
//       }
//       return "";
//     }

//     return "";
//   };

//   const saveAllForGuardian = async (list, whoLabel) => {
//     // Normalize أولاً
//     const fixed = list.map(normalizePhoneRow);

//     // تحقق Primary phone واحد فقط
//     const primaries = fixed.filter((x) => x.type === "phone" && x.is_primary);
//     if (primaries.length > 1) {
//       throw new Error(`(${whoLabel}) مسموح رقم هاتف واحد فقط كـ Primary`);
//     }

//     // ✅ تجاهل الصفوف الناقصة بدل ما توقف الحفظ كله
//     const validRows = [];
//     for (let i = 0; i < fixed.length; i++) {
//       const err = validateRow(fixed[i], whoLabel, i);
//       if (err) {
//         // إذا بدك توقف مباشرة بدل التجاهل، استبدل السطرين الجايين بـ: throw new Error(err)
//         notify.error(err);
//         continue;
//       }
//       validRows.push(fixed[i]);
//     }

//     // ما في صفوف صالحة
//     if (!validRows.length) return;

//     for (const it of validRows) {
//       const payload = buildPayload(it);

//       if (it.id) {
//         setItems((prev) =>
//           prev.map((x) => (x.id === it.id ? { ...x, ...it } : x)),
//         );

//         await updateContact({ id: it.id, ...payload }).unwrap();
//       } else {
//         const res = await addContact(payload).unwrap();

//         // إذا السيرفر رجّع عنصر
//         const created = res?.data;

//         // ✅ بدّل العنصر المحلي الجديد (اللي ما معه id) بعنصر معه id
//         if (created?.id) {
//           setItems((prev) =>
//             prev.map((x) =>
//               x._cid === it._cid ? { ...x, id: created.id, _isNew: false } : x,
//             ),
//           );
//         } else {
//           // حتى لو السيرفر رجع nulls، على الأقل اعتبره محفوظ
//           setItems((prev) =>
//             prev.map((x) => (x._cid === it._cid ? { ...x, _isNew: false } : x)),
//           );
//         }
//       }
//     }
//   };

//   const handleSave = async () => {
//     try {
//       await saveAllForGuardian(itemsFather, "الأب");
//       await saveAllForGuardian(itemsMother, "الأم");

//       notify.success("تم حفظ معلومات التواصل");
//       await onSaved?.(); // ✅ إذا onSaved refetch
//       onClose?.();
//     } catch (e) {
//       notify.error(e?.message || e?.data?.message || "فشل الحفظ");
//       console.error(e);
//     }
//   };

//   /* ================= UI ================= */
//   const title = step === 1 ? "معلومات تواصل الأب" : "معلومات تواصل الأم";

//   return open ? (
//     <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
//       <div className="w-[520px] bg-white h-full flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4">
//           <div>
//             <h2 className="text-[#6F013F] font-semibold">
//               تعديل معلومات التواصل
//             </h2>
//             <p className="text-xs text-gray-500 mt-0.5">
//               {student?.full_name ?? ""}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-800"
//           >
//             <X />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
//           <h3 className="text-[#6F013F] font-semibold text-sm">{title}</h3>

//           {/* add/edit */}
//           <div className="space-y-3 border border-gray-200 rounded-xl p-4">
//             <p className="text-sm font-medium text-gray-700">
//               {draft?.id ? "تعديل جهة تواصل" : "إضافة جهة تواصل"}
//             </p>

//             <SearchableSelect
//               label="نوع جهة الاتصال"
//               required
//               value={draft.type}
//               onChange={(v) =>
//                 setDraft((d) => ({
//                   ...d,
//                   type: v,
//                   country_code: "",
//                   phone_number: "",
//                   full_phone_number: "",
//                   value: "",
//                   notes: d.notes || "",
//                   is_primary: false,
//                 }))
//               }
//               options={TYPE_OPTIONS}
//               placeholder="اختر النوع"
//               allowClear
//             />

//             {(draft.type === "phone" || draft.type === "whatsapp") && (
//               <PhoneInputSplit
//                 label={draft.type === "whatsapp" ? "رقم واتساب" : "رقم الهاتف"}
//                 countryCode={draft.country_code}
//                 phoneNumber={draft.phone_number}
//                 onChange={({ country_code, phone_number }) =>
//                   setDraft((d) => ({
//                     ...d,
//                     country_code,
//                     phone_number,
//                     full_phone_number:
//                       clean(country_code) && clean(phone_number)
//                         ? `${clean(country_code)}${clean(phone_number)}`
//                         : "",
//                     value:
//                       d.type === "whatsapp" || d.type === "phone"
//                         ? phone_number
//                         : d.value,
//                   }))
//                 }
//               />
//             )}

//             {draft.type === "email" && (
//               <InputField
//                 label="البريد الإلكتروني"
//                 required
//                 type="email"
//                 value={draft.value}
//                 onChange={(e) =>
//                   setDraft((d) => ({ ...d, value: e.target.value }))
//                 }
//               />
//             )}

//             <InputField
//               label="ملاحظات (اختياري)"
//               placeholder="200 محرف كحد أقصى"
//               value={draft.notes}
//               onChange={(e) => {
//                 const v = e.target.value;
//                 if (String(v).length > 200) return;
//                 setDraft((d) => ({ ...d, notes: v }));
//               }}
//               error=""
//             />

//             {showPrimaryCheckbox ? (
//               <label className="flex items-center gap-2 text-sm text-gray-700">
//                 <input
//                   type="checkbox"
//                   className="accent-[#6F013F]"
//                   checked={!!draft.is_primary}
//                   onChange={(e) =>
//                     setDraft((d) => ({ ...d, is_primary: e.target.checked }))
//                   }
//                 />
//                 جهة الاتصال الأساسية (Primary)
//               </label>
//             ) : primaryHint ? (
//               <div className="text-xs text-gray-500">{primaryHint}</div>
//             ) : null}

//             <div className="flex items-center gap-2 justify-end">
//               {draft?.id ? (
//                 <button
//                   type="button"
//                   onClick={resetDraft}
//                   className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
//                 >
//                   إلغاء التعديل
//                 </button>
//               ) : null}

//               <GradientButton
//                 type="button"
//                 onClick={addOrUpdateItem}
//                 disabled={!canAdd()}
//                 className="py-2"
//               >
//                 {draft?.id ? "تحديث" : "إضافة"}
//               </GradientButton>
//             </div>
//           </div>

//           {/* list */}
//           <div className="space-y-2">
//             {items.length === 0 ? (
//               <p className="text-xs text-gray-500">لا يوجد بيانات تواصل.</p>
//             ) : (
//               items.map((it, idx) => (
//                 <div
//                   key={it.id ?? `new-${idx}`}
//                   className="border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-3"
//                 >
//                   <div className="space-y-1">
//                     <p className="text-sm font-medium text-gray-800">
//                       {guardianName(it.guardian_id)}
//                     </p>

//                     <p className="text-xs text-gray-600">
//                       النوع: {TYPE_LABEL[it.type] || it.type}
//                     </p>

//                     {it.type === "email" ? (
//                       <p className="text-xs text-gray-600">
//                         الإيميل: {it.value}
//                       </p>
//                     ) : (
//                       <p className="text-xs text-gray-600">
//                         الرقم: {displayPhone(it)}
//                       </p>
//                     )}

//                     {it.notes ? (
//                       <p className="text-xs text-gray-500">
//                         ملاحظات: {it.notes}
//                       </p>
//                     ) : null}

//                     {it.is_primary && (
//                       <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-pink-100 text-[#6F013F]">
//                         Primary
//                       </span>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <button
//                       type="button"
//                       onClick={() => editItem(it)}
//                       className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
//                       title="تعديل"
//                     >
//                       <Pencil className="w-4 h-4" />
//                     </button>

//                     <button
//                       type="button"
//                       onClick={() => removeItem(it)}
//                       className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
//                       title="حذف"
//                       disabled={isSaving}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4">
//           <StepButtonsSmart
//             step={step}
//             total={2}
//             onBack={step === 1 ? onClose : () => setStep(1)}
//             onNext={step === 2 ? handleSave : () => setStep(2)}
//             submitLabel="حفظ"
//             loading={isSaving}
//           />
//         </div>
//       </div>
//     </div>
//   ) : null;
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import InputField from "@/components/common/InputField";
import PhoneInputSplit from "@/components/common/PhoneInputSplit";
import GradientButton from "@/components/common/GradientButton";

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
  supports_call: true,
  supports_whatsapp: false,
  supports_sms: false,
  is_primary: false,
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
        : "phone";

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
        ? true
        : toBool(contact?.supports_call) ||
          (!("supports_call" in (contact || {})) && type === "phone"),
    supports_whatsapp:
      type === "landline" ? false : toBool(contact?.supports_whatsapp),
    supports_sms: type === "landline" ? false : toBool(contact?.supports_sms),
    is_primary: type === "phone" ? toBool(contact?.is_primary) : false,
    notes: clean(contact?.notes),
    guardian_id: contact?.guardian_id ?? null,
    student_id: contact?.student_id ?? ctx.studentId ?? null,
    family_id: contact?.family_id ?? ctx.familyId ?? null,
  };
};

const getOwnerKey = (row, ctx) => {
  const type = clean(row?.type);
  const ownerType = type === "landline" ? "family" : clean(row?.owner_type);

  if (type === "landline") return ctx.familyId ? `family:${ctx.familyId}` : "";
  if (!ownerType) return "";

  if (ownerType === "father" || ownerType === "mother") {
    const gid = resolveGuardianIdByOwnerType(ownerType, ctx.father, ctx.mother);
    return gid ? `guardian:${gid}` : "";
  }

  if (ownerType === "student") {
    return ctx.studentId ? `student:${ctx.studentId}` : "";
  }

  if (FAMILY_BASED_OWNER_TYPES.has(ownerType)) {
    return ctx.familyId ? `family:${ctx.familyId}` : "";
  }

  return "";
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

    if (row?.is_primary && !row?.supports_sms) {
      return "الرقم الأساسي يعتمد على استقبال الرسائل، لذلك يجب تفعيل supports_sms.";
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
    payload.is_primary = !!row.is_primary;

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
    payload.is_primary = false;

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

  if (ownerType === "family") {
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

  const ctx = useMemo(
    () => ({
      guardians,
      father,
      mother,
      studentId,
      familyId,
      studentName,
    }),
    [guardians, father, mother, studentId, familyId, studentName],
  );

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
  }, [open, student, ctx]);

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

  const currentOwnerKey = useMemo(() => getOwnerKey(draft, ctx), [draft, ctx]);

  const hasOtherPrimaryForCurrentOwner = useMemo(() => {
    if (!currentOwnerKey) return false;

    return items.some((x) => {
      if (x.type !== "phone" || !x.is_primary) return false;
      if (getOwnerKey(x, ctx) !== currentOwnerKey) return false;
      return localRowId(x) !== localRowId(draft);
    });
  }, [items, currentOwnerKey, draft, ctx]);

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
      is_primary: !!it.is_primary,
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

      if (row.is_primary) {
        const key = getOwnerKey(row, ctx);
        next = next.map((it) =>
          getOwnerKey(it, ctx) === key ? { ...it, is_primary: false } : it,
        );
      }

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
          notify.error(err, "تحقق من البيانات");
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
              required
              value={draft.type}
              onChange={(v) =>
                setDraft((d) => ({
                  ...emptyDraft(),
                  id: d.id ?? null,
                  _cid: d._cid ?? null,
                  type: v,
                  owner_type: v === "landline" ? "family" : "",
                  supports_call: v === "phone",
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
                  required
                  value={draft.owner_type}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      owner_type: v,
                      owner_name: FAMILY_BASED_OWNER_TYPES.has(v)
                        ? d.owner_name
                        : "",
                      is_primary: false,
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

            {(draft.type === "phone" || draft.type === "landline") && (
              <PhoneInputSplit
                label={
                  draft.type === "landline" ? "رقم الهاتف الأرضي" : "رقم الهاتف"
                }
                countryCode={draft.country_code}
                phoneNumber={draft.phone_number}
                onChange={({ country_code, phone_number }) =>
                  setDraft((d) => ({ ...d, country_code, phone_number }))
                }
              />
            )}

            {draft.type === "phone" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  استخدامات الرقم
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[#6F013F]"
                      checked={!!draft.supports_call}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          supports_call: e.target.checked,
                        }))
                      }
                    />
                    للاتصال
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[#6F013F]"
                      checked={!!draft.supports_whatsapp}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          supports_whatsapp: e.target.checked,
                        }))
                      }
                    />
                    للواتساب
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-[#6F013F]"
                      checked={!!draft.supports_sms}
                      onChange={(e) =>
                        setDraft((d) => {
                          const checked = e.target.checked;
                          return {
                            ...d,
                            supports_sms: checked,
                            is_primary: checked ? d.is_primary : false,
                          };
                        })
                      }
                    />
                    للرسائل
                  </label>
                </div>
              </div>
            ) : null}

            {draft.type === "phone" ? (
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="accent-[#6F013F]"
                    checked={!!draft.is_primary}
                    disabled={!draft.supports_sms}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, is_primary: e.target.checked }))
                    }
                  />
                  الرقم الأساسي لهذا المالك
                </label>

                {!draft.supports_sms ? (
                  <p className="text-xs text-gray-500">
                    لا يمكن جعل الرقم أساسياً إلا إذا كان يستقبل رسائل SMS.
                  </p>
                ) : hasOtherPrimaryForCurrentOwner ? (
                  <p className="text-xs text-gray-500">
                    يوجد رقم أساسي آخر لهذا المالك، وسيتم استبداله محلياً عند
                    الحفظ.
                  </p>
                ) : null}
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
                  إلغاء التعديل
                </button>
              ) : null}

              <GradientButton
                type="button"
                onClick={addOrUpdateItem}
                disabled={!!validateRow(draft, ctx)}
                className="py-2"
              >
                {draft?.id || draft?._cid ? "تحديث" : "إضافة"}
              </GradientButton>
            </div>
          </div>

          <div className="space-y-2">
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

                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {TYPE_LABEL[it.type] || it.type}
                      </span>

                      {usageBadges(it).map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-full bg-purple-50 text-[#6F013F]"
                        >
                          {b}
                        </span>
                      ))}

                      {it.is_primary ? (
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#6F013F]">
                          Primary
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-gray-600">
                      الرقم: {clean(it.country_code)} {clean(it.phone_number)}
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
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(it)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
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
