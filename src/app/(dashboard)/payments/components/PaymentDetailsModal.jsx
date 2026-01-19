"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import Pagination from "@/components/common/Pagination";
import GradientButton from "@/components/common/GradientButton";
import { useGetStudentPaymentsSummaryQuery } from "@/store/services/studentPaymentsApi";

/* ================= Helpers ================= */

// ✅ 30 دفعة بدل 10
const installmentName = (i) => {
  const names = [
    "الأولى",
    "الثانية",
    "الثالثة",
    "الرابعة",
    "الخامسة",
    "السادسة",
    "السابعة",
    "الثامنة",
    "التاسعة",
    "العاشرة",
    "الحادية عشرة",
    "الثانية عشرة",
    "الثالثة عشرة",
    "الرابعة عشرة",
    "الخامسة عشرة",
    "السادسة عشرة",
    "السابعة عشرة",
    "الثامنة عشرة",
    "التاسعة عشرة",
    "العشرون",
    "الحادية والعشرون",
    "الثانية والعشرون",
    "الثالثة والعشرون",
    "الرابعة والعشرون",
    "الخامسة والعشرون",
    "السادسة والعشرون",
    "السابعة والعشرون",
    "الثامنة والعشرون",
    "التاسعة والعشرون",
    "الثلاثون",
  ];

  return names[i] ?? `دفعة ${i + 1}`;
};

const formatMoney = (usd) => {
  if (usd === undefined || usd === null || String(usd) === "") return "—";
  return `${usd}$`;
};

const safe = (v) =>
  v === undefined || v === null || String(v) === "" ? "—" : v;

export default function PaymentDetailsModal({
  open,
  onClose,
  studentId,
  payment, // صف الجدول (receipt_number, paid_date... إلخ)

  // اختياريين: إذا ما إجوا ما منهمّش الأزرار، بس مننفذ fallback
  onEditPayment,
  onDeletePayment,

  // (تركتهم مثل ما هنن)
  onSave,
  saving = false,
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    data: summaryRes,
    isLoading,
    isFetching,
  } = useGetStudentPaymentsSummaryQuery(studentId, {
    skip: !studentId || !open,
  });

  const loading = isLoading || isFetching;

  // ✅ API عندك يرجع: { status, message, data: {...} }
  const payload = summaryRes?.data ?? summaryRes;

  const studentName = payload?.student_name ?? "—";
  const courseName = payload?.current_batch?.name ?? "—";

  const contract0 = payload?.contracts_summary?.[0] ?? null;
  const totalAmountUsd = contract0?.total_amount_usd ?? "—";
  const remainingAmountUsd = contract0?.remaining_amount_usd ?? "—";
  const discountPercentage = contract0?.discount_percentage ?? "—";

  const payments = useMemo(() => {
    const arr = payload?.payments ?? [];
    return Array.isArray(arr) ? arr : [];
  }, [payload]);

  const topReceiptNumber =
    payment?.receipt_number ??
    payment?.receiptNumber ??
    payments?.[0]?.receipt_number ??
    "—";

  /* ================= Pagination ================= */
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const totalPages = Math.ceil(payments.length / pageSize) || 1;
  const paginated = payments.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (!open) return;
    setPage(1);
  }, [open, payments.length, studentId]);

  /* ================= actions (fallback) ================= */
  const handleEditClick = (row) => {
    if (onEditPayment) return onEditPayment(row);
    // ✅ fallback: على الأقل اعمل log لتعرف انه ما انبعت handler
    console.warn("onEditPayment is not provided", row);
  };

  const handleDeleteClick = (row) => {
    if (onDeletePayment) return onDeletePayment(row);
    console.warn("onDeletePayment is not provided", row);
  };

  if (!mounted || !open) return null;

  const modal = (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex justify-start">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        dir="rtl"
        className="relative w-full sm:w-[560px] bg-white h-full shadow-xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#6F013F] font-semibold">تفاصيل الدفعة</h2>

          {/* زر X بالأعلى يبقى */}
          <button type="button" onClick={onClose}>
            <span className="text-gray-500 hover:text-gray-700 text-xl">✕</span>
          </button>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
        ) : !payload ? (
          <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
        ) : (
          <>
            {/* Top info */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm text-gray-700">
              <InfoLine label="اسم الطالب" value={studentName} />
              <InfoLine
                label="المبلغ الكلي"
                value={formatMoney(totalAmountUsd)}
              />

              <InfoLine label="الدورة" value={courseName} />
              <InfoLine
                label="المبلغ المتبقي"
                value={formatMoney(remainingAmountUsd)}
              />

              <InfoLine label="رقم الإيصال" value={safe(topReceiptNumber)} />
              <InfoLine
                label="نسبة الخصم"
                value={safe(discountPercentage)}
                suffix="%"
              />
            </div>

            <div className="border-t my-6" />

            {/* Table */}
            {!payments.length ? (
              <div className="py-14 text-center text-gray-400">
                لا توجد دفعات.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
                    <thead>
                      <tr className="bg-pink-50 text-gray-700">
                        <th className="p-3 text-center rounded-r-xl">#</th>
                        <th className="p-3">المبلغ</th>
                        <th className="p-3">الدفعة</th>
                        <th className="p-3">تاريخ الدفع</th>
                        <th className="p-3">رقم الإيصال</th>
                        <th className="p-3 text-center rounded-l-xl">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginated.map((row, idx) => {
                        const globalIndex = (page - 1) * pageSize + idx;
                        const payDate = row?.payment_date ?? row?.paid_date;

                        return (
                          <tr
                            key={String(
                              row?.id ?? row?.receipt_number ?? globalIndex
                            )}
                            className="bg-white hover:bg-pink-50 transition"
                          >
                            <td className="p-3 text-center rounded-r-xl">
                              {globalIndex + 1}
                            </td>

                            <td className="p-3">
                              {formatMoney(row?.amount_usd)}
                            </td>

                            <td className="p-3">
                              {installmentName(globalIndex)}
                            </td>

                            <td className="p-3">{safe(payDate)}</td>

                            <td className="p-3">{safe(row?.receipt_number)}</td>

                            {/* ✅ الإجراءات شغالة دائماً */}
                            <td className="p-3 text-center rounded-l-xl">
                              <div className="flex justify-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(row)}
                                  className="hover:opacity-80"
                                  title="حذف"
                                >
                                  <Image
                                    src="/icons/Trash.png"
                                    alt="trash"
                                    width={18}
                                    height={18}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEditClick(row)}
                                  className="hover:opacity-80"
                                  title="تعديل"
                                >
                                  <Image
                                    src="/icons/Edit.png"
                                    alt="edit"
                                    width={18}
                                    height={18}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              {/* ✅ زر إغلاق بدل زر حذف */}
              <GradientButton onClick={onClose} className="px-8">
                إغلاق
              </GradientButton>

              {/* زر حفظ إذا موجود */}
              {onSave && (
                <GradientButton
                  onClick={() => onSave?.([])}
                  disabled={saving}
                  className="px-8"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ"}
                </GradientButton>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

function InfoLine({ label, value, suffix = "" }) {
  return (
    <div className="flex items-center justify-start gap-4">
      <span className="text-gray-500">{label + " : "}</span>
      <span className="font-medium text-gray-800">
        {value ?? "—"}
        {value !== "—" ? suffix : ""}
      </span>
    </div>
  );
}
