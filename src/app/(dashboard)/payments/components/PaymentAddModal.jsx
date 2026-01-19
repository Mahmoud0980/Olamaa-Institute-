// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { X } from "lucide-react";
// import toast from "react-hot-toast";

// import Stepper from "@/components/common/Stepper";
// import FormInput from "@/components/common/InputField";
// import StepButtonsSmart from "@/components/common/StepButtonsSmart";
// import SearchableSelect from "@/components/common/SearchableSelect";

// import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// function toNumOrNull(v) {
//   if (v === "" || v === null || v === undefined) return null;
//   const n = Number(v);
//   return Number.isNaN(n) ? null : n;
// }

// export default function PaymentAddModal({
//   open,
//   title = "إضافة دفعة",
//   loading = false,
//   onClose,
//   onSubmit,

//   students = [],
//   defaultInstituteBranchId = "",
//   initialData = null,
//   showReason = false,
// }) {
//   const step = 1;
//   const total = 1;

//   // ✅ حماية: لو إجانا students بشكل object من API
//   const safeStudents = useMemo(() => {
//     if (Array.isArray(students)) return students;
//     if (Array.isArray(students?.data)) return students.data;
//     return [];
//   }, [students]);

//   // ✅ جلب فروع المعهد
//   const { data: branchesRes, isLoading: loadingBranches } =
//     useGetInstituteBranchesQuery();

//   const branches = useMemo(() => {
//     const arr = branchesRes?.data;
//     return Array.isArray(arr) ? arr : [];
//   }, [branchesRes]);

//   const branchOptions = useMemo(() => {
//     return branches
//       .filter((b) => b && b.id != null)
//       .map((b) => ({
//         value: String(b.id),
//         label: String(b.name ?? ""),
//       }))
//       .filter((o) => o.label.trim().length > 0);
//   }, [branches]);

//   const studentOptions = useMemo(() => {
//     const arr = Array.isArray(students)
//       ? students
//       : Array.isArray(students?.data)
//       ? students.data
//       : [];

//     return arr
//       .filter((s) => s && s.id != null)
//       .map((s) => ({
//         value: String(s.id),
//         label: String(
//           s.full_name ??
//             s.fullName ??
//             `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() ??
//             `طالب #${s.id}`
//         ).trim(),
//       }))
//       .filter((o) => o.label.length > 0);
//   }, [students]);

//   const studentMap = useMemo(() => {
//     const arr = Array.isArray(students)
//       ? students
//       : Array.isArray(students?.data)
//       ? students.data
//       : [];

//     const map = new Map();
//     arr.forEach((s) => map.set(String(s.id), s));
//     return map;
//   }, [students]);

//   const currencyOptions = useMemo(
//     () => [
//       { value: "USD", label: "USD" },
//       { value: "SYP", label: "SYP" },
//     ],
//     []
//   );

//   const [form, setForm] = useState({
//     receipt_number: "",
//     institute_branch_id: defaultInstituteBranchId
//       ? String(defaultInstituteBranchId)
//       : "",
//     student_id: "",
//     enrollment_contract_id: "",
//     payment_installments_id: null,
//     currency: "USD",
//     amount_usd: "",
//     amount_syp: "",
//     exchange_rate_at_payment: "",
//     paid_date: "",
//     description: "",
//     reason: "",
//   });

//   // ✅ تعبئة عند الفتح
//   useEffect(() => {
//     if (!open) return;

//     if (initialData) {
//       setForm({
//         receipt_number: initialData.receipt_number ?? "",
//         institute_branch_id: String(initialData.institute_branch_id ?? ""),
//         student_id: String(initialData.student_id ?? ""),
//         enrollment_contract_id: String(
//           initialData.enrollment_contract_id ?? ""
//         ),
//         payment_installments_id: initialData.payment_installments_id ?? null,
//         currency: initialData.currency ?? "USD",
//         amount_usd: initialData.amount_usd ?? "",
//         amount_syp: initialData.amount_syp ?? "",
//         exchange_rate_at_payment: initialData.exchange_rate_at_payment ?? "",
//         paid_date: initialData.paid_date ?? "",
//         description: initialData.description ?? "",
//         reason: "",
//       });
//     } else {
//       setForm({
//         receipt_number: "",
//         institute_branch_id: defaultInstituteBranchId
//           ? String(defaultInstituteBranchId)
//           : "",
//         student_id: "",
//         enrollment_contract_id: "",
//         payment_installments_id: null,
//         currency: "USD",
//         amount_usd: "",
//         amount_syp: "",
//         exchange_rate_at_payment: "",
//         paid_date: "",
//         description: "",
//         reason: "",
//       });
//     }
//   }, [open, initialData, defaultInstituteBranchId]);

//   // ✅ لما يتغير الطالب: عبّي العقد + فرع المعهد تلقائيًا
//   useEffect(() => {
//     if (!open) return;
//     if (!form.student_id) return;

//     const s = studentMap.get(String(form.student_id));
//     if (!s) return;

//     const contractId = s?.enrollment_contract?.id;
//     const branchId = s?.institute_branch?.id;

//     setForm((prev) => ({
//       ...prev,
//       enrollment_contract_id: contractId
//         ? String(contractId)
//         : prev.enrollment_contract_id,
//       institute_branch_id: prev.institute_branch_id
//         ? prev.institute_branch_id
//         : branchId
//         ? String(branchId)
//         : "",
//     }));
//   }, [open, form.student_id, studentMap]);

//   const validate = () => {
//     if (!form.student_id) return "يرجى اختيار الطالب";
//     if (!form.institute_branch_id) return "يرجى اختيار فرع المعهد";
//     if (!form.enrollment_contract_id) return "لا يوجد عقد لهذا الطالب";
//     if (!form.paid_date) return "يرجى إدخال تاريخ الدفع";
//     if (!form.currency) return "يرجى اختيار العملة";

//     if (form.currency === "USD" && !form.amount_usd)
//       return "يرجى إدخال مبلغ USD";
//     if (form.currency === "SYP" && !form.amount_syp)
//       return "يرجى إدخال مبلغ ل.س";

//     if (
//       (form.currency === "SYP" || form.amount_syp) &&
//       !form.exchange_rate_at_payment
//     )
//       return "يرجى إدخال سعر الصرف";

//     if (showReason && initialData && !form.reason.trim())
//       return "يرجى إدخال سبب التعديل";

//     return null;
//   };

//   const handleSubmit = () => {
//     const err = validate();
//     if (err) return toast.error(err);

//     const payload = {
//       receipt_number: form.receipt_number || null,
//       institute_branch_id: toNumOrNull(form.institute_branch_id),
//       enrollment_contract_id: toNumOrNull(form.enrollment_contract_id),
//       student_id: toNumOrNull(form.student_id),
//       payment_installments_id: null,
//       amount_usd: toNumOrNull(form.amount_usd),
//       amount_syp: toNumOrNull(form.amount_syp),
//       exchange_rate_at_payment: toNumOrNull(form.exchange_rate_at_payment),
//       currency: form.currency || "USD",
//       paid_date: form.paid_date || null,
//       description: form.description || null,
//       ...(showReason ? { reason: form.reason || null } : {}),
//     };

//     onSubmit?.(payload);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md flex">
//       <div
//         dir="rtl"
//         className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto"
//       >
//         {/* HEADER */}
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-[#6F013F] font-semibold">
//             {initialData ? "تعديل دفعة" : title}
//           </h2>
//           <button onClick={onClose} type="button">
//             <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
//           </button>
//         </div>

//         <Stepper current={step} total={total} />

//         <div className="mt-6 space-y-5">
//           <FormInput
//             label="رقم الإيصال"
//             placeholder="REC-001"
//             value={form.receipt_number}
//             onChange={(e) =>
//               setForm((p) => ({ ...p, receipt_number: e.target.value }))
//             }
//           />

//           {/* ✅ فرع المعهد */}
//           <SearchableSelect
//             label="فرع المعهد"
//             required
//             value={form.institute_branch_id}
//             onChange={(v) => setForm((p) => ({ ...p, institute_branch_id: v }))}
//             options={branchOptions}
//             placeholder={loadingBranches ? "جارٍ التحميل..." : "اختر الفرع..."}
//             disabled={loadingBranches}
//           />

//           {/* ✅ الطالب */}
//           <SearchableSelect
//             label="الطالب"
//             required
//             value={form.student_id}
//             onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
//             options={studentOptions}
//             placeholder={
//               studentOptions.length ? "اختر الطالب..." : "لا يوجد طلاب"
//             }
//             allowClear
//           />

//           {/* ✅ العقد readOnly */}
//           <FormInput
//             label="رقم العقد"
//             required
//             value={form.enrollment_contract_id}
//             onChange={() => {}}
//             readOnly
//             placeholder="سيتم تعبئته تلقائياً"
//           />

//           {/* ✅ العملة بنفس SearchableSelect */}
//           <SearchableSelect
//             label="العملة"
//             required
//             value={form.currency}
//             onChange={(v) => setForm((p) => ({ ...p, currency: v }))}
//             options={currencyOptions}
//             placeholder="اختر العملة..."
//             allowClear={false}
//           />

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <FormInput
//               label="سعر الصرف"
//               required={form.currency === "SYP" || !!form.amount_syp}
//               placeholder="10000"
//               value={form.exchange_rate_at_payment}
//               onChange={(e) =>
//                 setForm((p) => ({
//                   ...p,
//                   exchange_rate_at_payment: e.target.value,
//                 }))
//               }
//             />

//             <FormInput
//               label="تاريخ الدفع"
//               required
//               type="date"
//               value={form.paid_date}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, paid_date: e.target.value }))
//               }
//             />
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <FormInput
//               label="المبلغ بالدولار"
//               required={form.currency === "USD"}
//               placeholder="100"
//               value={form.amount_usd}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, amount_usd: e.target.value }))
//               }
//             />

//             <FormInput
//               label="المبلغ بالليرة"
//               required={form.currency === "SYP"}
//               placeholder="1000000"
//               value={form.amount_syp}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, amount_syp: e.target.value }))
//               }
//             />
//           </div>

//           <FormInput
//             label="الوصف"
//             placeholder="دفعة نقدًا..."
//             value={form.description}
//             onChange={(e) =>
//               setForm((p) => ({ ...p, description: e.target.value }))
//             }
//           />

//           {showReason && initialData && (
//             <FormInput
//               label="سبب التعديل"
//               required
//               placeholder="سبب تعديل الدفعة..."
//               value={form.reason}
//               onChange={(e) =>
//                 setForm((p) => ({ ...p, reason: e.target.value }))
//               }
//             />
//           )}

//           <StepButtonsSmart
//             step={step}
//             total={total}
//             isEdit={!!initialData}
//             loading={loading}
//             onNext={handleSubmit}
//             onBack={onClose}
//             nextLabel={initialData ? "تحديث" : "حفظ"}
//           />
//         </div>
//       </div>

//       {/* click outside */}
//       <div className="flex-1" onClick={onClose} />
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export default function PaymentAddModal({
  open,
  title = "إضافة دفعة",
  loading = false,
  onClose,
  onSubmit,

  students = [],
  defaultInstituteBranchId = "",
  initialData = null,
  showReason = false,
}) {
  const step = 1;
  const total = 1;

  // ✅ حماية: لو إجانا students بشكل object من API
  const safeStudents = useMemo(() => {
    if (Array.isArray(students)) return students;
    if (Array.isArray(students?.data)) return students.data;
    return [];
  }, [students]);

  // ✅ جلب فروع المعهد
  const { data: branchesRes, isLoading: loadingBranches } =
    useGetInstituteBranchesQuery();

  const branches = useMemo(() => {
    const arr = branchesRes?.data;
    return Array.isArray(arr) ? arr : [];
  }, [branchesRes]);

  const branchOptions = useMemo(() => {
    return branches
      .filter((b) => b && b.id != null)
      .map((b) => ({
        value: String(b.id),
        label: String(b.name ?? "").trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [branches]);

  const studentOptions = useMemo(() => {
    return safeStudents
      .filter((s) => s && s.id != null)
      .map((s) => ({
        value: String(s.id),
        label: String(
          s.full_name ??
            s.fullName ??
            `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() ??
            `طالب #${s.id}`
        ).trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [safeStudents]);

  const studentMap = useMemo(() => {
    const map = new Map();
    safeStudents.forEach((s) => map.set(String(s.id), s));
    return map;
  }, [safeStudents]);

  const currencyOptions = useMemo(
    () => [
      { value: "USD", label: "USD" },
      { value: "SYP", label: "SYP" },
    ],
    []
  );

  const [form, setForm] = useState({
    receipt_number: "",
    institute_branch_id: defaultInstituteBranchId
      ? String(defaultInstituteBranchId)
      : "",
    student_id: "",
    currency: "USD",
    amount_usd: "",
    amount_syp: "",
    exchange_rate_at_payment: "",
    paid_date: "",
    description: "",
    reason: "",
  });

  // ✅ تعبئة عند الفتح
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        receipt_number: initialData.receipt_number ?? "",
        institute_branch_id: String(initialData.institute_branch_id ?? ""),
        student_id: String(initialData.student_id ?? ""),
        currency: initialData.currency ?? "USD",
        amount_usd: initialData.amount_usd ?? "",
        amount_syp: initialData.amount_syp ?? "",
        exchange_rate_at_payment: initialData.exchange_rate_at_payment ?? "",
        paid_date: initialData.paid_date ?? "",
        description: initialData.description ?? "",
        reason: "",
      });
    } else {
      setForm({
        receipt_number: "",
        institute_branch_id: defaultInstituteBranchId
          ? String(defaultInstituteBranchId)
          : "",
        student_id: "",
        currency: "USD",
        amount_usd: "",
        amount_syp: "",
        exchange_rate_at_payment: "",
        paid_date: "",
        description: "",
        reason: "",
      });
    }
  }, [open, initialData, defaultInstituteBranchId]);

  // ✅ لما يتغير الطالب: عبّي فرع المعهد تلقائيًا (اختياري بس مفيد)
  useEffect(() => {
    if (!open) return;
    if (!form.student_id) return;

    const s = studentMap.get(String(form.student_id));
    if (!s) return;

    const branchId = s?.institute_branch?.id;

    setForm((prev) => ({
      ...prev,
      institute_branch_id: prev.institute_branch_id
        ? prev.institute_branch_id
        : branchId
        ? String(branchId)
        : "",
    }));
  }, [open, form.student_id, studentMap]);

  const validate = () => {
    if (!form.student_id) return "يرجى اختيار الطالب";
    if (!form.institute_branch_id) return "يرجى اختيار فرع المعهد";
    if (!form.paid_date) return "يرجى إدخال تاريخ الدفع";
    if (!form.currency) return "يرجى اختيار العملة";

    if (form.currency === "USD" && !form.amount_usd)
      return "يرجى إدخال مبلغ USD";
    if (form.currency === "SYP" && !form.amount_syp)
      return "يرجى إدخال مبلغ ل.س";

    if (
      (form.currency === "SYP" || form.amount_syp) &&
      !form.exchange_rate_at_payment
    )
      return "يرجى إدخال سعر الصرف";

    if (showReason && initialData && !form.reason.trim())
      return "يرجى إدخال سبب التعديل";

    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) return toast.error(err);

    const payload = {
      receipt_number: form.receipt_number || null,
      institute_branch_id: toNumOrNull(form.institute_branch_id),
      student_id: toNumOrNull(form.student_id),

      // ✅ حسب المطلوب
      amount_usd: toNumOrNull(form.amount_usd),
      amount_syp: toNumOrNull(form.amount_syp),
      exchange_rate_at_payment: toNumOrNull(form.exchange_rate_at_payment),
      currency: form.currency || "USD",
      paid_date: form.paid_date || null,
      description: form.description || null,

      ...(showReason ? { reason: form.reason || null } : {}),
    };

    onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md flex">
      <div
        dir="rtl"
        className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {initialData ? "تعديل دفعة" : title}
          </h2>
          <button onClick={onClose} type="button">
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="رقم الإيصال"
            placeholder="REC-001"
            value={form.receipt_number}
            onChange={(e) =>
              setForm((p) => ({ ...p, receipt_number: e.target.value }))
            }
          />

          {/* ✅ فرع المعهد */}
          <SearchableSelect
            label="فرع المعهد"
            required
            value={form.institute_branch_id}
            onChange={(v) => setForm((p) => ({ ...p, institute_branch_id: v }))}
            options={branchOptions}
            placeholder={loadingBranches ? "جارٍ التحميل..." : "اختر الفرع..."}
            disabled={loadingBranches}
          />

          {/* ✅ الطالب */}
          <SearchableSelect
            label="الطالب"
            required
            value={form.student_id}
            onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
            options={studentOptions}
            placeholder={
              studentOptions.length ? "اختر الطالب..." : "لا يوجد طلاب"
            }
            allowClear
          />

          {/* ✅ العملة بنفس SearchableSelect */}
          <SearchableSelect
            label="العملة"
            required
            value={form.currency}
            onChange={(v) => setForm((p) => ({ ...p, currency: v }))}
            options={currencyOptions}
            placeholder="اختر العملة..."
            allowClear={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="سعر الصرف"
              required={form.currency === "SYP" || !!form.amount_syp}
              placeholder="10000"
              value={form.exchange_rate_at_payment}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  exchange_rate_at_payment: e.target.value,
                }))
              }
            />

            <FormInput
              label="تاريخ الدفع"
              required
              type="date"
              value={form.paid_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, paid_date: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="المبلغ بالدولار"
              required={form.currency === "USD"}
              placeholder="100"
              value={form.amount_usd}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount_usd: e.target.value }))
              }
            />

            <FormInput
              label="المبلغ بالليرة"
              required={form.currency === "SYP"}
              placeholder="1000000"
              value={form.amount_syp}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount_syp: e.target.value }))
              }
            />
          </div>

          <FormInput
            label="الوصف"
            placeholder="دفعة نقدًا..."
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />

          {showReason && initialData && (
            <FormInput
              label="سبب التعديل"
              required
              placeholder="سبب تعديل الدفعة..."
              value={form.reason}
              onChange={(e) =>
                setForm((p) => ({ ...p, reason: e.target.value }))
              }
            />
          )}

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!initialData}
            loading={loading}
            onNext={handleSubmit}
            onBack={onClose}
            nextLabel={initialData ? "إرسال طلب تعديل" : "حفظ"}
          />
        </div>
      </div>

      {/* click outside */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
