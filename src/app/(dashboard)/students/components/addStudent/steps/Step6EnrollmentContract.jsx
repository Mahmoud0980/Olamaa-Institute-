// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { notify } from "@/lib/helpers/toastify";

// import InputField from "@/components/common/InputField";
// import SearchableSelect from "@/components/common/SearchableSelect";
// import StepButtonsSmart from "@/components/common/StepButtonsSmart";
// import DatePickerSmart from "@/components/common/DatePickerSmart";

// import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// import {
//   usePreviewInstallmentsMutation,
//   useAddEnrollmentContractMutation,
// } from "@/store/services/enrollmentContractsApi";

// const MODE_OPTIONS = [
//   { key: "automatic", value: "automatic", label: "أوتوماتيكي" },
//   { key: "manual", value: "manual", label: "يدوي" },
// ];

// const CURRENCY_OPTIONS = [
//   { key: "usd", value: "usd", label: "دولار (USD)" },
//   { key: "syp", value: "syp", label: "ليرة سورية (SYP)" },
// ];

// const PAYMENT_CURRENCY_OPTIONS = [
//   { key: "USD", value: "USD", label: "دولار (USD)" },
//   { key: "SYP", value: "SYP", label: "ليرة سورية (SYP)" },
// ];

// function addMonthsSafe(dateStr, months) {
//   const d = new Date(`${dateStr}T00:00:00`);
//   if (Number.isNaN(d.getTime())) return "";
//   const day = d.getDate();
//   d.setMonth(d.getMonth() + months);
//   if (d.getDate() !== day) d.setDate(0);
//   return d.toISOString().slice(0, 10);
// }

// export default function Step6EnrollmentContract({
//   studentId,
//   instituteBranchId,
//   onNext,
//   onBack,
//   onSkip,
// }) {
//   const [currency, setCurrency] = useState("usd");
//   const [mode, setMode] = useState("automatic");
//   const { data: branchesRes } = useGetInstituteBranchesQuery();

//   const branchOptions =
//     branchesRes?.data?.map((b) => ({
//       key: b.id,
//       value: String(b.id),
//       label: b.name,
//     })) || [];

//   const [form, setForm] = useState(() => ({
//     total_amount_usd: "",
//     final_amount_syp: "",
//     exchange_rate_at_enrollment: "",

//     discount_percentage: "",
//     discount_reason: "",

//     agreed_at: new Date().toISOString().slice(0, 10),
//     installments_start_date: "",
//     installments_count: "",

//     description: "",

//     first_payment_enabled: false,
//     first_payment: {
//       receipt_number: "",
//       currency: "USD",
//       amount_usd: "",
//       amount_syp: "",
//       exchange_rate_at_payment: "",
//       paid_date: "",
//       description: "دفعة أولى عند التسجيل",
//     },
//   }));

//   const [installments, setInstallments] = useState([]);

//   const [previewInstallments, { isLoading: previewLoading }] =
//     usePreviewInstallmentsMutation();

//   const [addContract, { isLoading: saving }] =
//     useAddEnrollmentContractMutation();

//   const handleChange = (name, value) => {
//     setForm((f) => ({ ...f, [name]: value }));
//   };

//   const handleFirstPaymentChange = (name, value) => {
//     setForm((p) => ({
//       ...p,
//       first_payment: { ...p.first_payment, [name]: value },
//     }));
//   };

//   const computed = useMemo(() => {
//     const discRaw =
//       form.discount_percentage === "" ? 0 : Number(form.discount_percentage);
//     const discount = Number.isFinite(discRaw)
//       ? Math.min(100, Math.max(0, discRaw))
//       : 0;

//     const rate = Number(form.exchange_rate_at_enrollment) || 0;

//     const totalUsd =
//       currency === "usd"
//         ? Number(form.total_amount_usd) || 0
//         : rate > 0
//           ? (Number(form.final_amount_syp) || 0) / rate
//           : 0;

//     const finalUsd = totalUsd - totalUsd * (discount / 100);

//     const finalSyp =
//       currency === "syp" && rate > 0 ? Math.round(finalUsd * rate) : 0;

//     return { discount, rate, totalUsd, finalUsd, finalSyp };
//   }, [
//     currency,
//     form.total_amount_usd,
//     form.final_amount_syp,
//     form.exchange_rate_at_enrollment,
//     form.discount_percentage,
//   ]);

//   useEffect(() => {
//     if (mode !== "automatic") return;
//     if (installments.length === 0) return;
//     setInstallments([]);
//   }, [
//     mode,
//     currency,
//     form.total_amount_usd,
//     form.final_amount_syp,
//     form.exchange_rate_at_enrollment,
//     form.discount_percentage,
//     form.installments_start_date,
//     form.agreed_at,
//   ]);

//   useEffect(() => {
//     setInstallments([]);
//   }, [mode]);

//   useEffect(() => {
//     if (mode !== "manual") return;

//     const count = Number(form.installments_count) || 0;

//     if (count <= 0) {
//       setInstallments([]);
//       return;
//     }

//     setInstallments((prev) => {
//       const next = Array.from({ length: count }, (_, idx) => {
//         const n = idx + 1;
//         const existing = prev.find((p) => Number(p.installment_number) === n);

//         const autoDate =
//           form.installments_start_date &&
//           String(form.installments_start_date).trim()
//             ? addMonthsSafe(form.installments_start_date, idx)
//             : "";

//         return {
//           installment_number: n,
//           due_date: existing?.due_date || autoDate || "",
//           planned_amount_usd: existing?.planned_amount_usd ?? "",
//         };
//       });

//       return next;
//     });
//   }, [mode, form.installments_count, form.installments_start_date]);

//   const validateCommon = () => {
//     if (!studentId) {
//       notify.error("الطالب غير محدد");
//       return false;
//     }

//     if (!form.agreed_at) {
//       notify.error("حدد تاريخ العقد / الاتفاق");
//       return false;
//     }

//     if (!form.installments_start_date) {
//       notify.error("حدد تاريخ بدء الأقساط");
//       return false;
//     }

//     if (String(form.installments_start_date) < String(form.agreed_at)) {
//       notify.error("تاريخ بدء الأقساط لا يمكن أن يكون قبل تاريخ العقد");
//       return false;
//     }

//     if (currency === "usd") {
//       if (!form.total_amount_usd || Number(form.total_amount_usd) <= 0) {
//         notify.error("أدخل المبلغ بالدولار");
//         return false;
//       }
//     } else {
//       if (!form.final_amount_syp || Number(form.final_amount_syp) <= 0) {
//         notify.error("أدخل المبلغ بالليرة السورية");
//         return false;
//       }
//       if (
//         !form.exchange_rate_at_enrollment ||
//         Number(form.exchange_rate_at_enrollment) <= 0
//       ) {
//         notify.error("أدخل سعر الصرف");
//         return false;
//       }
//     }

//     if (form.discount_percentage !== "") {
//       const disc = Number(form.discount_percentage);
//       if (!Number.isFinite(disc) || disc < 0 || disc > 100) {
//         notify.error("الحسم يجب أن يكون بين 0 و 100");
//         return false;
//       }
//       if (!form.discount_reason?.trim()) {
//         notify.error("سبب الحسم مطلوب عند إدخال حسم");
//         return false;
//       }
//     }

//     if (form.first_payment_enabled) {
//       const fp = form.first_payment;

//       if (!fp.institute_branch_id) {
//         notify.error("فرع المعهد مطلوب للدفعة الأولى");
//         return false;
//       }

//       if (!fp.receipt_number) {
//         notify.error("رقم الإيصال مطلوب للدفعة الأولى");
//         return false;
//       }

//       if (!fp.paid_date) {
//         notify.error("تاريخ الدفع مطلوب للدفعة الأولى");
//         return false;
//       }

//       if (fp.currency === "USD") {
//         if (!fp.amount_usd || Number(fp.amount_usd) <= 0) {
//           notify.error("أدخل مبلغ صحيح بالدولار للدفعة الأولى");
//           return false;
//         }
//       } else {
//         if (!fp.amount_syp || Number(fp.amount_syp) <= 0) {
//           notify.error("أدخل مبلغ صحيح بالليرة للدفعة الأولى");
//           return false;
//         }
//         if (
//           !fp.exchange_rate_at_payment ||
//           Number(fp.exchange_rate_at_payment) <= 0
//         ) {
//           notify.error("أدخل سعر صرف صحيح للدفعة الأولى");
//           return false;
//         }
//       }
//     }

//     return true;
//   };

//   const validateManualInstallments = () => {
//     const count = Number(form.installments_count) || 0;

//     if (count <= 0) {
//       notify.error("أدخل عدد الأقساط");
//       return false;
//     }

//     if (installments.length !== count) {
//       notify.error("عدد الأقساط لا يطابق عدد الحقول");
//       return false;
//     }

//     let sum = 0;

//     for (const inst of installments) {
//       if (!inst.due_date) {
//         notify.error(`حدد تاريخ القسط رقم ${inst.installment_number}`);
//         return false;
//       }

//       const amount = Number(inst.planned_amount_usd);

//       if (!amount || amount <= 0) {
//         notify.error(`أدخل قيمة صحيحة للقسط رقم ${inst.installment_number}`);
//         return false;
//       }

//       sum += amount;
//     }

//     const finalUsd = Number(computed.finalUsd.toFixed(2));
//     const sumRounded = Number(sum.toFixed(2));

//     if (sumRounded < finalUsd) {
//       notify.error(
//         `مجموع الأقساط (${sumRounded}$) أقل من المبلغ النهائي (${finalUsd}$)`,
//       );
//       return false;
//     }

//     if (sumRounded > finalUsd) {
//       notify.error(
//         `مجموع الأقساط (${sumRounded}$) أكبر من المبلغ النهائي (${finalUsd}$)`,
//       );
//       return false;
//     }

//     return true;
//   };

//   const buildPayloadBase = () => {
//     const contractCurrency = currency === "usd" ? "USD" : "SYP";

//     const disc =
//       form.discount_percentage === "" ? 0 : Number(form.discount_percentage);

//     const discount_percentage = Number.isFinite(disc) ? disc : 0;

//     const total_amount_usd = Number.isFinite(computed.totalUsd)
//       ? Number(computed.totalUsd.toFixed(2))
//       : 0;

//     const final_amount_usd = Number.isFinite(computed.finalUsd)
//       ? Number(computed.finalUsd.toFixed(2))
//       : 0;

//     return {
//       student_id: Number(studentId),
//       institute_branch_id: Number(instituteBranchId),
//       currency: contractCurrency,

//       total_amount_usd,
//       discount_percentage,
//       discount_reason: discount_percentage > 0 ? form.discount_reason : null,

//       final_amount_usd,
//       final_amount_syp: currency === "syp" ? computed.finalSyp : 0,
//       exchange_rate_at_enrollment: currency === "syp" ? computed.rate : 0,

//       agreed_at: form.agreed_at,
//       description: form.description,
//       is_active: true,

//       mode,
//       installments_start_date: form.installments_start_date,
//     };
//   };

//   const buildPayloadForPreview = () => {
//     const payload = buildPayloadBase();
//     payload.installments_count =
//       mode === "manual" ? Number(form.installments_count) || 0 : 1;
//     return payload;
//   };

//   const buildPayloadForSave = () => {
//     const payload = buildPayloadBase();

//     const normalizedInstallments = installments.map((i) => ({
//       installment_number: Number(i.installment_number),
//       due_date: i.due_date,
//       planned_amount_usd: Number(i.planned_amount_usd),
//     }));

//     payload.installments = normalizedInstallments;
//     payload.installments_count =
//       mode === "automatic"
//         ? Number(installments.length || 0)
//         : Number(form.installments_count || 0);

//     if (form.first_payment_enabled) {
//       const fp = form.first_payment;

//       let amount_usd = null;
//       let amount_syp = null;
//       let exchange_rate_at_payment = null;

//       if (fp.currency === "USD") {
//         amount_usd = Number(fp.amount_usd || 0);
//       } else {
//         exchange_rate_at_payment = Number(fp.exchange_rate_at_payment || 0);
//         amount_syp = Number(fp.amount_syp || 0);
//         amount_usd =
//           exchange_rate_at_payment > 0
//             ? amount_syp / exchange_rate_at_payment
//             : 0;
//       }

//       payload.first_payment = {
//         currency: fp.currency,
//         student_id: Number(studentId),
//         amount_usd:
//           amount_usd !== null ? Number(Number(amount_usd).toFixed(2)) : null,
//         amount_syp: fp.currency === "SYP" ? Number(amount_syp) : null,
//         exchange_rate_at_payment:
//           fp.currency === "SYP" ? Number(exchange_rate_at_payment) : null,
//         receipt_number: fp.receipt_number,
//         paid_date: fp.paid_date,
//         description: fp.description || "دفعة أولى عند التسجيل",
//         institute_branch_id: Number(fp.institute_branch_id),
//       };
//     }

//     return payload;
//   };

//   const handlePreview = async () => {
//     if (!validateCommon()) return;

//     const payload = buildPayloadForPreview();

//     try {
//       const res = await previewInstallments(payload).unwrap();
//       const list = res?.data?.installments || [];
//       setInstallments(list);
//       notify.success(res?.data?.message || "تمت معاينة الأقساط");
//     } catch (err) {
//       console.error("Preview Error:", err?.data || err);
//       notify.error(err?.data?.message || "فشل في معاينة الأقساط");
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateCommon()) return;

//     if (mode === "automatic" && installments.length === 0) {
//       notify.error("يجب معاينة الأقساط قبل الحفظ");
//       return;
//     }

//     if (mode === "manual" && !validateManualInstallments()) return;

//     const payload = buildPayloadForSave();

//     try {
//       await addContract(payload).unwrap();
//       notify.success("تم حفظ عقد التسجيل");
//       onNext?.();
//     } catch (err) {
//       console.error("Save Error:", err?.data || err);

//       const errors = err?.data?.errors;
//       if (errors) {
//         const firstErrorKey = Object.keys(errors)[0];
//         const firstErrorMessage = errors[firstErrorKey]?.[0];
//         if (firstErrorMessage) {
//           notify.error(firstErrorMessage);
//           return;
//         }
//       }

//       notify.error(err?.data?.message || "فشل حفظ العقد");
//     }
//   };

//   const handleInstallmentChange = (installment_number, field, value) => {
//     setInstallments((prev) =>
//       prev.map((inst) =>
//         Number(inst.installment_number) === Number(installment_number)
//           ? { ...inst, [field]: value }
//           : inst,
//       ),
//     );
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* ===== Header ثابت (اختياري) ===== */}
//       <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-1 pb-3 pt-1">
//         <div className="flex items-center justify-between">
//           <h3 className="text-[#6F013F] font-semibold text-sm">
//             عقد التسجيل والأقساط
//           </h3>
//           <span className="text-[11px] text-gray-400">الخطوة 6</span>
//         </div>
//       </div>

//       {/* ===== Body (سكرول هنا فقط) ===== */}
//       <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4">
//         <div className="space-y-4">
//           <SearchableSelect
//             label="العملة"
//             value={currency}
//             onChange={setCurrency}
//             options={CURRENCY_OPTIONS}
//             allowClear
//           />

//           <InputField
//             label="الحسم (%)"
//             type="number"
//             placeholder="مثال: 10"
//             value={form.discount_percentage}
//             onChange={(e) =>
//               handleChange("discount_percentage", e.target.value)
//             }
//           />

//           {form.discount_percentage !== "" &&
//             Number(form.discount_percentage) > 0 && (
//               <InputField
//                 label="سبب الحسم"
//                 placeholder="مثال: خصم للطالب المتفوق"
//                 value={form.discount_reason}
//                 onChange={(e) =>
//                   handleChange("discount_reason", e.target.value)
//                 }
//               />
//             )}

//           {/* ✅ agreed_at */}
//           <DatePickerSmart
//             label="تاريخ العقد / الاتفاق"
//             value={form.agreed_at}
//             onChange={(iso) => handleChange("agreed_at", iso || "")}
//             format="DD/MM/YYYY"
//             allowClear={false}
//           />

//           {currency === "usd" && (
//             <InputField
//               label="المبلغ بالدولار"
//               type="number"
//               value={form.total_amount_usd}
//               onChange={(e) => handleChange("total_amount_usd", e.target.value)}
//             />
//           )}

//           {currency === "syp" && (
//             <>
//               <InputField
//                 label="المبلغ بالليرة السورية (قبل الحسم)"
//                 type="number"
//                 value={form.final_amount_syp}
//                 onChange={(e) =>
//                   handleChange("final_amount_syp", e.target.value)
//                 }
//               />
//               <InputField
//                 label="سعر الصرف"
//                 type="number"
//                 value={form.exchange_rate_at_enrollment}
//                 onChange={(e) =>
//                   handleChange("exchange_rate_at_enrollment", e.target.value)
//                 }
//               />
//             </>
//           )}

//           <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700">
//             <div>
//               المبلغ بعد الحسم: {Number(computed.finalUsd || 0).toFixed(2)} USD
//             </div>
//             {currency === "syp" && computed.rate > 0 && (
//               <div>يعادل تقريباً: {computed.finalSyp || 0} SYP</div>
//             )}
//           </div>

//           <SearchableSelect
//             label="طريقة الأقساط"
//             value={mode}
//             onChange={setMode}
//             options={MODE_OPTIONS}
//             allowClear
//           />

//           {/* ✅ installments_start_date */}
//           <DatePickerSmart
//             label="تاريخ بدء الأقساط"
//             value={form.installments_start_date}
//             onChange={(iso) =>
//               handleChange("installments_start_date", iso || "")
//             }
//             format="DD/MM/YYYY"
//             allowClear
//           />

//           {mode === "manual" && (
//             <InputField
//               label="عدد الأقساط"
//               type="number"
//               value={form.installments_count}
//               onChange={(e) =>
//                 handleChange("installments_count", e.target.value)
//               }
//             />
//           )}

//           {mode === "automatic" && (
//             <button
//               type="button"
//               onClick={handlePreview}
//               className="w-full bg-gray-100 rounded-xl py-2 text-sm hover:bg-gray-200 transition"
//               disabled={previewLoading}
//             >
//               معاينة الأقساط
//             </button>
//           )}

//           {/* automatic list */}
//           {mode === "automatic" && installments.length > 0 && (
//             <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
//               {installments.map((i) => (
//                 <div
//                   key={i.installment_number}
//                   className="border border-gray-100 rounded-xl p-2 text-sm text-gray-700"
//                 >
//                   <div className="font-medium text-gray-800">
//                     القسط #{i.installment_number}
//                   </div>

//                   <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
//                     <div>
//                       تاريخ الاستحقاق:{" "}
//                       <span className="text-gray-800">{i.due_date || "-"}</span>
//                     </div>
//                     <div>
//                       المبلغ (USD):{" "}
//                       <span className="text-gray-800">
//                         {i.planned_amount_usd ?? "-"}
//                       </span>
//                     </div>
//                     <div>
//                       سعر الصرف:{" "}
//                       <span className="text-gray-800">
//                         {i.exchange_rate_at_due_date ?? "-"}
//                       </span>
//                     </div>
//                     <div>
//                       المبلغ (SYP):{" "}
//                       <span className="text-gray-800">
//                         {i.planned_amount_syp ?? "-"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* manual list */}
//           {mode === "manual" && installments.length > 0 && (
//             <div className="space-y-2">
//               <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 px-1">
//                 <div>رقم الدفعة</div>
//                 <div>تاريخ الاستحقاق</div>
//                 <div>الدفعة (USD)</div>
//               </div>

//               <div className="space-y-2">
//                 {installments.map((inst) => (
//                   <div
//                     key={inst.installment_number}
//                     className="grid grid-cols-3 gap-2 items-start"
//                   >
//                     <div className="text-sm text-gray-700 pt-2">
//                       #{inst.installment_number}
//                     </div>

//                     {/* ✅ due_date */}
//                     <DatePickerSmart
//                       value={inst.due_date || ""}
//                       onChange={(iso) =>
//                         handleInstallmentChange(
//                           inst.installment_number,
//                           "due_date",
//                           iso || "",
//                         )
//                       }
//                       format="DD/MM/YYYY"
//                       placeholder="dd/mm/yyyy"
//                       allowClear
//                     />

//                     <input
//                       type="number"
//                       value={inst.planned_amount_usd ?? ""}
//                       onChange={(e) =>
//                         handleInstallmentChange(
//                           inst.installment_number,
//                           "planned_amount_usd",
//                           e.target.value,
//                         )
//                       }
//                       className="w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#6F013F] focus:ring-1 focus:ring-[#F4D3E3]"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* first payment */}
//           <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
//             <div className="flex items-center justify-between">
//               <div className="text-sm font-medium text-gray-700">
//                 الدفعة الأولى
//               </div>
//               <label className="flex items-center gap-2 text-sm text-gray-700">
//                 <input
//                   type="checkbox"
//                   checked={form.first_payment_enabled}
//                   onChange={(e) =>
//                     handleChange("first_payment_enabled", e.target.checked)
//                   }
//                 />
//                 إضافة دفعة أولى الآن
//               </label>
//             </div>

//             {form.first_payment_enabled && (
//               <div className="space-y-3">
//                 <InputField
//                   label="رقم الإيصال"
//                   value={form.first_payment.receipt_number}
//                   onChange={(e) =>
//                     handleFirstPaymentChange("receipt_number", e.target.value)
//                   }
//                 />

//                 <SearchableSelect
//                   label="فرع المعهد"
//                   required
//                   value={form.first_payment.institute_branch_id}
//                   onChange={(v) =>
//                     handleFirstPaymentChange("institute_branch_id", v)
//                   }
//                   options={branchOptions}
//                   placeholder="اختر فرع المعهد"
//                   allowClear
//                 />

//                 <SearchableSelect
//                   label="عملة الدفعة"
//                   value={form.first_payment.currency}
//                   onChange={(v) => handleFirstPaymentChange("currency", v)}
//                   options={PAYMENT_CURRENCY_OPTIONS}
//                   allowClear={false}
//                 />

//                 {/* ✅ paid_date */}
//                 <DatePickerSmart
//                   label="تاريخ الدفع"
//                   value={form.first_payment.paid_date}
//                   onChange={(iso) =>
//                     handleFirstPaymentChange("paid_date", iso || "")
//                   }
//                   format="DD/MM/YYYY"
//                   allowClear
//                 />

//                 {form.first_payment.currency === "USD" ? (
//                   <InputField
//                     label="المبلغ بالدولار"
//                     type="number"
//                     value={form.first_payment.amount_usd}
//                     onChange={(e) =>
//                       handleFirstPaymentChange("amount_usd", e.target.value)
//                     }
//                   />
//                 ) : (
//                   <>
//                     <InputField
//                       label="سعر الصرف"
//                       type="number"
//                       value={form.first_payment.exchange_rate_at_payment}
//                       onChange={(e) =>
//                         handleFirstPaymentChange(
//                           "exchange_rate_at_payment",
//                           e.target.value,
//                         )
//                       }
//                     />
//                     <InputField
//                       label="المبلغ بالليرة"
//                       type="number"
//                       value={form.first_payment.amount_syp}
//                       onChange={(e) =>
//                         handleFirstPaymentChange("amount_syp", e.target.value)
//                       }
//                     />
//                   </>
//                 )}

//                 <InputField
//                   label="ملاحظات الدفعة"
//                   value={form.first_payment.description}
//                   onChange={(e) =>
//                     handleFirstPaymentChange("description", e.target.value)
//                   }
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ===== Footer ثابت ===== */}
//       <div className="shrink-0 bg-white/90 backdrop-blur border-t border-gray-100 px-1 pt-3 pb-2">
//         <div className="flex items-center justify-between gap-3">
//           <button
//             type="button"
//             onClick={onSkip}
//             className="text-xs text-gray-500 hover:text-[#6F013F] transition"
//             disabled={saving || previewLoading}
//           >
//             تخطي هذه الخطوة
//           </button>

//           <StepButtonsSmart
//             step={6}
//             total={6}
//             onBack={onBack}
//             onNext={handleSubmit}
//             loading={saving || previewLoading}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { notify } from "@/lib/helpers/toastify";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DatePickerSmart from "@/components/common/DatePickerSmart";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

import {
  usePreviewInstallmentsMutation,
  useAddEnrollmentContractMutation,
} from "@/store/services/enrollmentContractsApi";

const MODE_OPTIONS = [
  { key: "automatic", value: "automatic", label: "أوتوماتيكي" },
  { key: "manual", value: "manual", label: "يدوي" },
];

const CURRENCY_OPTIONS = [
  { key: "usd", value: "usd", label: "دولار (USD)" },
  { key: "syp", value: "syp", label: "ليرة سورية (SYP)" },
];

const PAYMENT_CURRENCY_OPTIONS = [
  { key: "USD", value: "USD", label: "دولار (USD)" },
  { key: "SYP", value: "SYP", label: "ليرة سورية (SYP)" },
];

function addMonthsSafe(dateStr, months) {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) d.setDate(0);
  return d.toISOString().slice(0, 10);
}

export default function Step6EnrollmentContract({
  studentId,
  instituteBranchId,
  deferSave = false,
  onFinalSubmit,
  onNext,
  onBack,
  onSkip,
  loading = false,
}) {
  const [currency, setCurrency] = useState("usd");
  const [mode, setMode] = useState("automatic");
  const { data: branchesRes } = useGetInstituteBranchesQuery();

  const branchOptions =
    branchesRes?.data?.map((b) => ({
      key: b.id,
      value: String(b.id),
      label: b.name,
    })) || [];

  const [form, setForm] = useState(() => ({
    total_amount_usd: "",
    final_amount_syp: "",
    exchange_rate_at_enrollment: "",

    discount_percentage: "",
    discount_reason: "",

    agreed_at: new Date().toISOString().slice(0, 10),
    installments_start_date: "",
    installments_count: "",

    description: "",

    first_payment_enabled: false,
    first_payment: {
      receipt_number: "",
      currency: "USD",
      amount_usd: "",
      amount_syp: "",
      exchange_rate_at_payment: "",
      paid_date: "",
      description: "دفعة أولى عند التسجيل",
      institute_branch_id: "",
    },
  }));

  const [installments, setInstallments] = useState([]);

  const [previewInstallments, { isLoading: previewLoading }] =
    usePreviewInstallmentsMutation();

  const [addContract, { isLoading: saving }] =
    useAddEnrollmentContractMutation();

  const isActuallySaving = saving || loading;

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleFirstPaymentChange = (name, value) => {
    setForm((p) => ({
      ...p,
      first_payment: { ...p.first_payment, [name]: value },
    }));
  };

  // ✅ حسابات ثابتة لتجنب float rounding اللي بيعمل 1200 -> 1199
  const computed = useMemo(() => {
    const discRaw =
      form.discount_percentage === "" ? 0 : Number(form.discount_percentage);

    const discount = Number.isFinite(discRaw)
      ? Math.min(100, Math.max(0, discRaw))
      : 0;

    const rate = Number(form.exchange_rate_at_enrollment) || 0;

    const totalUsdRaw =
      currency === "usd"
        ? Number(form.total_amount_usd) || 0
        : rate > 0
          ? (Number(form.final_amount_syp) || 0) / rate
          : 0;

    // ✅ تثبيت USD على 2 decimals
    const totalUsd = Number(totalUsdRaw.toFixed(2));

    const finalUsdRaw = totalUsd - totalUsd * (discount / 100);
    const finalUsd = Number(finalUsdRaw.toFixed(2));

    // ✅ SYP رقم صحيح بعد تثبيت finalUsd
    const finalSyp =
      currency === "syp" && rate > 0 ? Math.round(finalUsd * rate) : 0;

    return { discount, rate, totalUsd, finalUsd, finalSyp };
  }, [
    currency,
    form.total_amount_usd,
    form.final_amount_syp,
    form.exchange_rate_at_enrollment,
    form.discount_percentage,
  ]);

  // reset installments when key inputs change (automatic)
  useEffect(() => {
    if (mode !== "automatic") return;
    if (installments.length === 0) return;
    setInstallments([]);
  }, [
    mode,
    currency,
    form.total_amount_usd,
    form.final_amount_syp,
    form.exchange_rate_at_enrollment,
    form.discount_percentage,
    form.installments_start_date,
    form.agreed_at,
  ]);

  // reset when mode changes
  useEffect(() => {
    setInstallments([]);
  }, [mode]);

  // build manual installments fields
  useEffect(() => {
    if (mode !== "manual") return;

    const count = Number(form.installments_count) || 0;

    if (count <= 0) {
      setInstallments([]);
      return;
    }

    setInstallments((prev) => {
      const next = Array.from({ length: count }, (_, idx) => {
        const n = idx + 1;
        const existing = prev.find((p) => Number(p.installment_number) === n);

        const autoDate =
          form.installments_start_date &&
          String(form.installments_start_date).trim()
            ? addMonthsSafe(form.installments_start_date, idx)
            : "";

        return {
          installment_number: n,
          due_date: existing?.due_date || autoDate || "",
          planned_amount_usd: existing?.planned_amount_usd ?? "",
        };
      });

      return next;
    });
  }, [mode, form.installments_count, form.installments_start_date]);

  const validateCommon = () => {
    if (!studentId && !deferSave) {
      notify.error("الطالب غير محدد");
      return false;
    }

    if (!form.agreed_at) {
      notify.error("حدد تاريخ العقد / الاتفاق");
      return false;
    }

    if (!form.installments_start_date) {
      notify.error("حدد تاريخ بدء الأقساط");
      return false;
    }

    if (String(form.installments_start_date) < String(form.agreed_at)) {
      notify.error("تاريخ بدء الأقساط لا يمكن أن يكون قبل تاريخ العقد");
      return false;
    }

    if (currency === "usd") {
      if (!form.total_amount_usd || Number(form.total_amount_usd) <= 0) {
        notify.error("أدخل المبلغ بالدولار");
        return false;
      }
    } else {
      if (!form.final_amount_syp || Number(form.final_amount_syp) <= 0) {
        notify.error("أدخل المبلغ بالليرة السورية");
        return false;
      }
      if (
        !form.exchange_rate_at_enrollment ||
        Number(form.exchange_rate_at_enrollment) <= 0
      ) {
        notify.error("أدخل سعر الصرف");
        return false;
      }
    }

    // ✅ الحسم فقط 1..100 إذا مكتوب
    if (form.discount_percentage !== "") {
      const disc = Number(form.discount_percentage);
      if (!Number.isFinite(disc) || disc < 1 || disc > 100) {
        notify.error("الحسم يجب أن يكون بين 1 و 100");
        return false;
      }
      if (!form.discount_reason?.trim()) {
        notify.error("سبب الحسم مطلوب عند إدخال حسم");
        return false;
      }
    }

    if (form.first_payment_enabled) {
      const fp = form.first_payment;

      if (!fp.institute_branch_id) {
        notify.error("فرع المعهد مطلوب للدفعة الأولى");
        return false;
      }

      if (!fp.receipt_number) {
        notify.error("رقم الإيصال مطلوب للدفعة الأولى");
        return false;
      }

      if (!fp.paid_date) {
        notify.error("تاريخ الدفع مطلوب للدفعة الأولى");
        return false;
      }

      if (fp.currency === "USD") {
        if (!fp.amount_usd || Number(fp.amount_usd) <= 0) {
          notify.error("أدخل مبلغ صحيح بالدولار للدفعة الأولى");
          return false;
        }
      } else {
        if (!fp.amount_syp || Number(fp.amount_syp) <= 0) {
          notify.error("أدخل مبلغ صحيح بالليرة للدفعة الأولى");
          return false;
        }
        if (
          !fp.exchange_rate_at_payment ||
          Number(fp.exchange_rate_at_payment) <= 0
        ) {
          notify.error("أدخل سعر صرف صحيح للدفعة الأولى");
          return false;
        }
      }
    }

    return true;
  };
  const onlyNumberString = (s) => String(s ?? "").replace(/[^\d.]/g, "");
  const clampNumber = (n, min, max) => Math.min(max, Math.max(min, n));
  const validateManualInstallments = () => {
    const count = Number(form.installments_count) || 0;

    if (count <= 0) {
      notify.error("أدخل عدد الأقساط");
      return false;
    }

    if (installments.length !== count) {
      notify.error("عدد الأقساط لا يطابق عدد الحقول");
      return false;
    }

    let sum = 0;

    for (const inst of installments) {
      if (!inst.due_date) {
        notify.error(`حدد تاريخ القسط رقم ${inst.installment_number}`);
        return false;
      }

      const amount = Number(inst.planned_amount_usd);

      if (!amount || amount <= 0) {
        notify.error(`أدخل قيمة صحيحة للقسط رقم ${inst.installment_number}`);
        return false;
      }

      sum += amount;
    }

    const finalUsd = Number(Number(computed.finalUsd || 0).toFixed(2));
    const sumRounded = Number(sum.toFixed(2));

    if (sumRounded < finalUsd) {
      notify.error(
        `مجموع الأقساط (${sumRounded}$) أقل من المبلغ النهائي (${finalUsd}$)`,
      );
      return false;
    }

    if (sumRounded > finalUsd) {
      notify.error(
        `مجموع الأقساط (${sumRounded}$) أكبر من المبلغ النهائي (${finalUsd}$)`,
      );
      return false;
    }

    return true;
  };

  const buildPayloadBase = () => {
    const contractCurrency = currency === "usd" ? "USD" : "SYP";

    const disc =
      form.discount_percentage === "" ? 0 : Number(form.discount_percentage);

    const discount_percentage = Number.isFinite(disc) ? disc : 0;

    const total_amount_usd = Number.isFinite(computed.totalUsd)
      ? Number(computed.totalUsd.toFixed(2))
      : 0;

    const final_amount_usd = Number.isFinite(computed.finalUsd)
      ? Number(computed.finalUsd.toFixed(2))
      : 0;

    return {
      student_id: studentId ? Number(studentId) : null,
      institute_branch_id: Number(instituteBranchId),
      currency: contractCurrency,

      total_amount_usd,
      discount_percentage,
      discount_reason: discount_percentage > 0 ? form.discount_reason : null,

      final_amount_usd,
      final_amount_syp: currency === "syp" ? computed.finalSyp : 0,
      exchange_rate_at_enrollment: currency === "syp" ? computed.rate : 0,

      agreed_at: form.agreed_at,
      description: form.description,
      is_active: true,

      mode,
      installments_start_date: form.installments_start_date,
    };
  };

  const buildPayloadForPreview = () => {
    const payload = buildPayloadBase();
    payload.installments_count =
      mode === "manual" ? Number(form.installments_count) || 0 : 1;
    return payload;
  };

  const buildPayloadForSave = () => {
    const payload = buildPayloadBase();

    const normalizedInstallments = installments.map((i) => ({
      installment_number: Number(i.installment_number),
      due_date: i.due_date,
      planned_amount_usd: Number(i.planned_amount_usd),
    }));

    payload.installments = normalizedInstallments;

    payload.installments_count =
      mode === "automatic"
        ? Number(normalizedInstallments.length || 0)
        : Number(form.installments_count || 0);

    if (form.first_payment_enabled) {
      const fp = form.first_payment;

      let amount_usd = null;
      let amount_syp = null;
      let exchange_rate_at_payment = null;

      if (fp.currency === "USD") {
        amount_usd = Number(fp.amount_usd || 0);
      } else {
        exchange_rate_at_payment = Number(fp.exchange_rate_at_payment || 0);
        amount_syp = Number(fp.amount_syp || 0);
        amount_usd =
          exchange_rate_at_payment > 0
            ? amount_syp / exchange_rate_at_payment
            : 0;
      }

      payload.first_payment = {
        currency: fp.currency,
        student_id: studentId ? Number(studentId) : null,
        amount_usd:
          amount_usd !== null ? Number(Number(amount_usd).toFixed(2)) : null,
        amount_syp: fp.currency === "SYP" ? Number(amount_syp) : null,
        exchange_rate_at_payment:
          fp.currency === "SYP" ? Number(exchange_rate_at_payment) : null,
        receipt_number: fp.receipt_number,
        paid_date: fp.paid_date,
        description: fp.description || "دفعة أولى عند التسجيل",
        institute_branch_id: Number(fp.institute_branch_id),
      };
    }

    return payload;
  };

  // ✅ نسخة للحفظ باستخدام أقساط رجعت من preview مباشرة (بدون انتظار setState)
  const buildPayloadForSaveUsing = (list) => {
    const payload = buildPayloadBase();

    const normalizedInstallments = (list || []).map((i) => ({
      installment_number: Number(i.installment_number),
      due_date: i.due_date,
      planned_amount_usd: Number(i.planned_amount_usd),
    }));

    payload.installments = normalizedInstallments;

    payload.installments_count =
      mode === "automatic"
        ? Number(normalizedInstallments.length || 0)
        : Number(form.installments_count || 0);

    if (form.first_payment_enabled) {
      const fp = form.first_payment;

      let amount_usd = null;
      let amount_syp = null;
      let exchange_rate_at_payment = null;

      if (fp.currency === "USD") {
        amount_usd = Number(fp.amount_usd || 0);
      } else {
        exchange_rate_at_payment = Number(fp.exchange_rate_at_payment || 0);
        amount_syp = Number(fp.amount_syp || 0);
        amount_usd =
          exchange_rate_at_payment > 0
            ? amount_syp / exchange_rate_at_payment
            : 0;
      }

      payload.first_payment = {
        currency: fp.currency,
        student_id: studentId ? Number(studentId) : null,
        amount_usd:
          amount_usd !== null ? Number(Number(amount_usd).toFixed(2)) : null,
        amount_syp: fp.currency === "SYP" ? Number(amount_syp) : null,
        exchange_rate_at_payment:
          fp.currency === "SYP" ? Number(exchange_rate_at_payment) : null,
        receipt_number: fp.receipt_number,
        paid_date: fp.paid_date,
        description: fp.description || "دفعة أولى عند التسجيل",
        institute_branch_id: Number(fp.institute_branch_id),
      };
    }

    return payload;
  };

  const handlePreview = async () => {
    if (!validateCommon()) return;

    const payload = buildPayloadForPreview();
    if (!payload.student_id && deferSave) {
        payload.student_id = 1; // Fake ID just for preview logic at the server side since we don't have one yet.
    }

    try {
      const res = await previewInstallments(payload).unwrap();
      const list = res?.data?.installments || [];
      setInstallments(list);
      notify.success(res?.data?.message || "تمت معاينة الأقساط");
    } catch (err) {
      console.error("Preview Error:", err?.data || err);
      notify.error(err?.data?.message || "فشل في معاينة الأقساط");
    }
  };

  // ✅ إنهاء: preview تلقائي بالخلفية إذا automatic ولم يتم preview
  const handleSubmit = async () => {
    if (!validateCommon()) return;

    try {
      // automatic: إذا ما في أقساط -> preview ثم save مباشرة
      if (mode === "automatic" && installments.length === 0) {
        const previewPayload = buildPayloadForPreview();
        if (!previewPayload.student_id && deferSave) {
            previewPayload.student_id = 1; // Fake ID just for preview logic
        }

        const res = await previewInstallments(previewPayload).unwrap();
        const list = res?.data?.installments || [];

        if (!Array.isArray(list) || list.length === 0) {
          notify.error("تعذر توليد الأقساط تلقائياً");
          return;
        }

        setInstallments(list);

        const savePayload = buildPayloadForSaveUsing(list);
        if (deferSave) {
          onFinalSubmit?.(savePayload);
          return;
        }
        await addContract(savePayload).unwrap();

        notify.success("تم حفظ عقد التسجيل");
        onNext?.();
        return;
      }

      // manual
      if (mode === "manual" && !validateManualInstallments()) return;

      // automatic وفي أقساط جاهزة
      const payload = buildPayloadForSave();
      
      if (deferSave) {
        onFinalSubmit?.(payload);
        return;
      }
      
      await addContract(payload).unwrap();

      notify.success("تم حفظ عقد التسجيل");
      onNext?.();
    } catch (err) {
      console.error("Save Error:", err?.data || err);

      const errors = err?.data?.errors;
      if (errors) {
        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorMessage = errors[firstErrorKey]?.[0];
        if (firstErrorMessage) {
          notify.error(firstErrorMessage);
          return;
        }
      }

      notify.error(err?.data?.message || "فشل حفظ العقد");
    }
  };

  const handleInstallmentChange = (installment_number, field, value) => {
    setInstallments((prev) =>
      prev.map((inst) =>
        Number(inst.installment_number) === Number(installment_number)
          ? { ...inst, [field]: value }
          : inst,
      ),
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* ===== Header ثابت ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-b border-gray-100 px-1 pb-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[#6F013F] font-semibold text-sm">
            عقد التسجيل والأقساط
          </h3>
          <span className="text-[11px] text-gray-400">الخطوة 6</span>
        </div>
      </div>

      {/* ===== Body (سكرول هنا فقط) ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto px-1 py-4">
        <div className="space-y-4">
          <SearchableSelect
            label="العملة"
            value={currency}
            onChange={setCurrency}
            options={CURRENCY_OPTIONS}
            allowClear
          />

          {/* ✅ الحسم clamp 1..100 */}
          {/* <InputField
            label="الحسم (%)"
            type="number"
            placeholder="مثال: 10"
            value={form.discount_percentage}
            onChange={(e) => {
              const raw = e.target.value;

              if (raw === "") {
                handleChange("discount_percentage", "");
                return;
              }

              let n = Number(raw);
              if (!Number.isFinite(n)) return;

              // فقط 1..100
              n = Math.max(1, Math.min(100, n));
              handleChange("discount_percentage", String(n));
            }}
          /> */}
          <InputField
            label="الحسم (%)"
            type="text"
            inputMode="numeric"
            value={form.discount_percentage}
            onChange={(e) => {
              const v = String(e.target.value ?? "")
                .replace(/\D/g, "")
                .slice(0, 3);
              handleChange("discount_percentage", v);
            }}
            onBlur={() => {
              if (form.discount_percentage === "") return;
              const n = Number(form.discount_percentage);
              if (!Number.isFinite(n)) return;
              const clamped = clampNumber(n, 1, 100);
              handleChange("discount_percentage", String(clamped));
            }}
          />

          {form.discount_percentage !== "" &&
            Number(form.discount_percentage) > 0 && (
              <InputField
                label="سبب الحسم"
                placeholder="مثال: خصم للطالب المتفوق"
                value={form.discount_reason}
                onChange={(e) =>
                  handleChange("discount_reason", e.target.value)
                }
              />
            )}

          <DatePickerSmart
            label="تاريخ العقد / الاتفاق"
            value={form.agreed_at}
            onChange={(iso) => handleChange("agreed_at", iso || "")}
            format="DD/MM/YYYY"
            allowClear={false}
          />

          {currency === "usd" && (
            // <InputField
            //   label="المبلغ بالدولار"
            //   type="number"
            //   value={form.total_amount_usd}
            //   onChange={(e) => handleChange("total_amount_usd", e.target.value)}
            // />
            <InputField
              label="المبلغ بالدولار"
              type="text"
              inputMode="decimal"
              value={form.total_amount_usd}
              onChange={(e) => {
                // ✅ لا تحوّل لـ Number هون
                const v = onlyNumberString(e.target.value);
                handleChange("total_amount_usd", v);
              }}
              onBlur={() => {
                // ✅ هون بس منثبت/نرتب الرقم
                const n = Number(form.total_amount_usd);
                if (!Number.isFinite(n)) return;
                handleChange("total_amount_usd", String(Number(n.toFixed(2))));
              }}
            />
          )}

          {currency === "syp" && (
            <>
              {/* <InputField
                label="المبلغ بالليرة السورية (قبل الحسم)"
                type="number"
                value={form.final_amount_syp}
                onChange={(e) =>
                  handleChange("final_amount_syp", e.target.value)
                }
              /> */}
              <InputField
                label="المبلغ بالليرة السورية"
                type="text"
                inputMode="numeric"
                value={form.final_amount_syp}
                onChange={(e) => {
                  const v = String(e.target.value ?? "").replace(/\D/g, "");
                  handleChange("final_amount_syp", v);
                }}
                onBlur={() => {
                  const n = Number(form.final_amount_syp);
                  if (!Number.isFinite(n)) return;
                  handleChange("final_amount_syp", String(Math.round(n)));
                }}
              />
              {/* <InputField
                label="سعر الصرف"
                type="number"
                value={form.exchange_rate_at_enrollment}
                onChange={(e) =>
                  handleChange("exchange_rate_at_enrollment", e.target.value)
                }
              /> */}
              <InputField
                label="سعر الصرف"
                type="text"
                inputMode="decimal"
                value={form.exchange_rate_at_enrollment}
                onChange={(e) => {
                  const v = onlyNumberString(e.target.value);
                  handleChange("exchange_rate_at_enrollment", v);
                }}
                onBlur={() => {
                  const n = Number(form.exchange_rate_at_enrollment);
                  if (!Number.isFinite(n)) return;
                  handleChange(
                    "exchange_rate_at_enrollment",
                    String(Number(n.toFixed(2))),
                  );
                }}
              />
            </>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-700">
            <div>
              المبلغ بعد الحسم: {Number(computed.finalUsd || 0).toFixed(2)} USD
            </div>
            {currency === "syp" && computed.rate > 0 && (
              <div>يعادل تقريباً: {computed.finalSyp || 0} SYP</div>
            )}
          </div>

          <SearchableSelect
            label="طريقة الأقساط"
            value={mode}
            onChange={setMode}
            options={MODE_OPTIONS}
            allowClear
          />

          <DatePickerSmart
            label="تاريخ بدء الأقساط"
            value={form.installments_start_date}
            onChange={(iso) =>
              handleChange("installments_start_date", iso || "")
            }
            format="DD/MM/YYYY"
            allowClear
          />

          {mode === "manual" && (
            <InputField
              label="عدد الأقساط"
              type="number"
              value={form.installments_count}
              onChange={(e) =>
                handleChange("installments_count", e.target.value)
              }
            />
          )}

          {/* زر معاينة (لسا موجود) */}
          {mode === "automatic" && (
            <button
              type="button"
              onClick={handlePreview}
              className="w-full bg-gray-100 rounded-xl py-2 text-sm hover:bg-gray-200 transition"
              disabled={previewLoading || saving}
            >
              معاينة الأقساط
            </button>
          )}

          {/* automatic list */}
          {mode === "automatic" && installments.length > 0 && (
            <div className="border border-gray-200 rounded-xl p-3 bg-white space-y-2">
              {installments.map((i) => (
                <div
                  key={i.installment_number}
                  className="border border-gray-100 rounded-xl p-2 text-sm text-gray-700"
                >
                  <div className="font-medium text-gray-800">
                    القسط #{i.installment_number}
                  </div>

                  <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                    <div>
                      تاريخ الاستحقاق:{" "}
                      <span className="text-gray-800">{i.due_date || "-"}</span>
                    </div>
                    <div>
                      المبلغ (USD):{" "}
                      <span className="text-gray-800">
                        {i.planned_amount_usd ?? "-"}
                      </span>
                    </div>
                    <div>
                      سعر الصرف:{" "}
                      <span className="text-gray-800">
                        {i.exchange_rate_at_due_date ?? "-"}
                      </span>
                    </div>
                    <div>
                      المبلغ (SYP):{" "}
                      <span className="text-gray-800">
                        {i.planned_amount_syp ?? "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* manual list */}
          {mode === "manual" && installments.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 px-1">
                <div>رقم الدفعة</div>
                <div>تاريخ الاستحقاق</div>
                <div>الدفعة (USD)</div>
              </div>

              <div className="space-y-2">
                {installments.map((inst) => (
                  <div
                    key={inst.installment_number}
                    className="grid grid-cols-3 gap-2 items-start"
                  >
                    <div className="text-sm text-gray-700 pt-2">
                      #{inst.installment_number}
                    </div>

                    <DatePickerSmart
                      value={inst.due_date || ""}
                      onChange={(iso) =>
                        handleInstallmentChange(
                          inst.installment_number,
                          "due_date",
                          iso || "",
                        )
                      }
                      format="DD/MM/YYYY"
                      placeholder="dd/mm/yyyy"
                      allowClear
                    />

                    <input
                      type="number"
                      value={inst.planned_amount_usd ?? ""}
                      onChange={(e) =>
                        handleInstallmentChange(
                          inst.installment_number,
                          "planned_amount_usd",
                          e.target.value,
                        )
                      }
                      className="w-full border border-gray-200 rounded-xl bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#6F013F] focus:ring-1 focus:ring-[#F4D3E3]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* first payment */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                الدفعة الأولى
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.first_payment_enabled}
                  onChange={(e) =>
                    handleChange("first_payment_enabled", e.target.checked)
                  }
                />
                إضافة دفعة أولى الآن
              </label>
            </div>

            {form.first_payment_enabled && (
              <div className="space-y-3">
                <InputField
                  label="رقم الإيصال"
                  value={form.first_payment.receipt_number}
                  onChange={(e) =>
                    handleFirstPaymentChange("receipt_number", e.target.value)
                  }
                />

                <SearchableSelect
                  label="فرع المعهد"
                  required
                  value={form.first_payment.institute_branch_id}
                  onChange={(v) =>
                    handleFirstPaymentChange("institute_branch_id", v)
                  }
                  options={branchOptions}
                  placeholder="اختر فرع المعهد"
                  allowClear
                />

                <SearchableSelect
                  label="عملة الدفعة"
                  value={form.first_payment.currency}
                  onChange={(v) => handleFirstPaymentChange("currency", v)}
                  options={PAYMENT_CURRENCY_OPTIONS}
                  allowClear={false}
                />

                <DatePickerSmart
                  label="تاريخ الدفع"
                  value={form.first_payment.paid_date}
                  onChange={(iso) =>
                    handleFirstPaymentChange("paid_date", iso || "")
                  }
                  format="DD/MM/YYYY"
                  allowClear
                />

                {form.first_payment.currency === "USD" ? (
                  <InputField
                    label="المبلغ بالدولار"
                    type="number"
                    value={form.first_payment.amount_usd}
                    onChange={(e) =>
                      handleFirstPaymentChange("amount_usd", e.target.value)
                    }
                  />
                ) : (
                  <>
                    <InputField
                      label="سعر الصرف"
                      type="number"
                      value={form.first_payment.exchange_rate_at_payment}
                      onChange={(e) =>
                        handleFirstPaymentChange(
                          "exchange_rate_at_payment",
                          e.target.value,
                        )
                      }
                    />
                    <InputField
                      label="المبلغ بالليرة"
                      type="number"
                      value={form.first_payment.amount_syp}
                      onChange={(e) =>
                        handleFirstPaymentChange("amount_syp", e.target.value)
                      }
                    />
                  </>
                )}

                <InputField
                  label="ملاحظات الدفعة"
                  value={form.first_payment.description}
                  onChange={(e) =>
                    handleFirstPaymentChange("description", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Footer ثابت ===== */}
      <div className="shrink-0 bg-white/90 backdrop-blur border-t border-gray-100 px-1 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-gray-500 hover:text-[#6F013F] transition"
            disabled={isActuallySaving || previewLoading}
          >
            تخطي هذه الخطوة
          </button>

          <StepButtonsSmart
            step={6}
            total={6}
            onBack={onBack}
            onNext={handleSubmit}
            loading={isActuallySaving || previewLoading}
          />
        </div>
      </div>
    </div>
  );
}
