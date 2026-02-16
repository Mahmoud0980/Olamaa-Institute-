"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import Pagination from "@/components/common/Pagination";
import GradientButton from "@/components/common/GradientButton";
import { useGetStudentPaymentsSummaryQuery } from "@/store/services/studentPaymentsApi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";

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

const formatUsd = (v) => {
  if (v === undefined || v === null || String(v) === "") return "—";

  const n = Number(v);
  if (Number.isNaN(n)) return "—";

  return `${Math.round(n)}$`;
};

const formatRowMoney = (row) => {
  if (!row) return "—";
  const c = String(row?.currency || "").toUpperCase();

  if (c === "SYP") {
    const v = row?.amount_syp;
    if (v === undefined || v === null || String(v) === "") return "—";
    return `${v} ل.س`;
  }

  const v = row?.amount_usd;
  if (v === undefined || v === null || String(v) === "") return "—";
  return `${v}$`;
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
  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const payments = useMemo(() => {
    const arr = payload?.payments ?? [];
    const list = Array.isArray(arr) ? arr : [];

    return [...list].sort((a, b) => {
      const da = a?.paid_date || a?.payment_date || a?.created_at || "";
      const db = b?.paid_date || b?.payment_date || b?.created_at || "";
      return String(db).localeCompare(String(da)); // newest first
    });
  }, [payload]);

  const topReceiptNumber =
    payment?.receipt_number ??
    payment?.receiptNumber ??
    payments?.[0]?.receipt_number ??
    "—";

  /* ================= Pagination ================= */
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(payments.length / pageSize) || 1;
  const paginated = payments.slice((page - 1) * pageSize, page * pageSize);
  const handlePrintTable = () => {
    if (!payments.length) return;

    const rowsHtml = payments
      .map((row, i) => {
        const payDate = row?.payment_date ?? row?.paid_date ?? "—";

        return `
        <tr>
          <td>${i + 1}</td>
          <td>${formatRowMoney(row)}</td>
          <td>${installmentName(i)}</td>
          <td>${safe(payDate)}</td>
          <td>${safe(row?.receipt_number)}</td>
        </tr>
      `;
      })
      .join("");

    const html = `
    <html dir="rtl">
      <head>
        <style>
          body{font-family:Arial;padding:20px}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th,td{border:1px solid #ccc;padding:6px;text-align:right}
          th{background:#fbeaf3}
        </style>
      </head>
      <body>
        <h3>دفعات الطالب: ${safe(studentName)}</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المبلغ</th>
              <th>الدفعة</th>
              <th>تاريخ الدفع</th>
              <th>رقم الإيصال</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `;

    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const handleExcelTable = () => {
    if (!payments.length) return;

    const data = payments.map((row, i) => {
      const payDate = row?.payment_date ?? row?.paid_date ?? "—";

      return {
        "#": i + 1,
        المبلغ: formatRowMoney(row),
        الدفعة: installmentName(i),
        "تاريخ الدفع": safe(payDate),
        "رقم الإيصال": safe(row?.receipt_number),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), `دفعات_${studentName || "student"}.xlsx`);
  };

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
        className="relative w-full sm:w-[560px] bg-white h-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER (STICKY) ================= */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="px-6 py-4 flex items-center justify-between gap-3">
            <h2 className="text-[#6F013F] font-semibold">تفاصيل الدفعة</h2>

            {/* ✅ Buttons in header */}
            <div className="flex items-center gap-2">
              <PrintButton onClick={handlePrintTable} />
              <ExcelButton onClick={handleExcelTable} />

              <button
                type="button"
                onClick={onClose}
                className="px-2 text-xl text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        {/* ================= BODY ================= */}
        <div className="px-6 py-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">
              جارٍ التحميل...
            </div>
          ) : !payload ? (
            <div className="py-10 text-center text-gray-400">
              لا توجد بيانات.
            </div>
          ) : (
            <>
              {/* Top info */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm text-gray-700">
                <InfoLine label="اسم الطالب" value={studentName} />
                <InfoLine
                  label="المبلغ الكلي"
                  value={formatUsd(totalAmountUsd)}
                />

                <InfoLine label="الدورة" value={courseName} />
                <InfoLine
                  label="المبلغ المتبقي"
                  value={formatUsd(remainingAmountUsd)}
                />

                <InfoLine label="رقم الإيصال" value={safe(topReceiptNumber)} />
                <InfoLine
                  label="نسبة الخصم"
                  value={safe(discountPercentage)}
                  suffix="%"
                />
              </div>

              <div className="border-t my-6" />

              {/* ================= Table area with its own scroll ================= */}
              {!payments.length ? (
                <div className="py-14 text-center text-gray-400">
                  لا توجد دفعات.
                </div>
              ) : (
                <>
                  {/* ✅ scroll ONLY here */}
                  <div className="max-h-[55vh] overflow-y-auto pr-1">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
                        <thead className="sticky top-0 z-[1] bg-pink-50 text-gray-700">
                          <tr>
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

                                <td className="p-3">{formatRowMoney(row)}</td>

                                <td className="p-3">
                                  {installmentName(globalIndex)}
                                </td>

                                <td className="p-3">{safe(payDate)}</td>

                                <td className="p-3">
                                  {safe(row?.receipt_number)}
                                </td>

                                <td className="p-3 text-center rounded-l-xl">
                                  <div className="flex justify-center gap-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRowToDelete(row);
                                        setOpenDelete(true);
                                      }}
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
                  </div>

                  <div className="mt-4">
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="px-0 py-4 mt-4 flex justify-end gap-3">
                <GradientButton onClick={onClose} className="px-8">
                  إغلاق
                </GradientButton>

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
        {/* DeleteConfirmModal stays as is */}
        ...
      </div>

      <DeleteConfirmModal
        isOpen={openDelete}
        loading={deleting}
        description="هل أنت متأكد من إرسال طلب حذف هذه الدفعة؟"
        onClose={() => {
          if (deleting) return;
          setOpenDelete(false);
          setRowToDelete(null);
        }}
        onConfirm={async () => {
          if (!rowToDelete) return;

          setDeleting(true);
          try {
            await onDeletePayment?.(rowToDelete);
            setOpenDelete(false);
            setRowToDelete(null);
          } finally {
            setDeleting(false);
          }
        }}
      />
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
