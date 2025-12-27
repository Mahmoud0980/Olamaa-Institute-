"use client";

import { useMemo } from "react";
import { useGetStudentPaymentsSummaryQuery } from "@/store/services/studentPaymentsApi";

export default function PaymentsTab({ student, selectedDate }) {
  const { data, isLoading } = useGetStudentPaymentsSummaryQuery(student?.id, {
    skip: !student?.id,
  });

  // ================= استخراج الدفعات =================
  const payments = useMemo(() => {
    if (Array.isArray(data?.payments)) return data.payments;
    if (Array.isArray(data?.data?.payments)) return data.data.payments;
    return [];
  }, [data]);

  const summary = useMemo(() => {
    const s =
      data?.contracts_summary?.[0] || data?.data?.contracts_summary?.[0];
    return s || null;
  }, [data]);

  // ================= فلترة حسب التاريخ =================
  const filteredPayments = useMemo(() => {
    if (!selectedDate) return payments;

    const selected = selectedDate.toLocaleDateString("en-CA");

    return payments.filter((p) => p.payment_date === selected);
  }, [payments, selectedDate]);

  const lastReceipt =
    payments.length > 0 ? payments[payments.length - 1].receipt_number : "—";

  if (isLoading) {
    return (
      <div className="text-gray-500 text-sm text-center py-6">
        جاري تحميل الدفعات...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ================= ملخص الدفعات ================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6">
          <SummaryItem
            label="اسم الطالب"
            value={
              data?.student_name ||
              data?.data?.student_name ||
              student?.full_name ||
              "—"
            }
          />
          <SummaryItem label="رقم الإيصال" value={lastReceipt} />
          <SummaryItem
            label="الدورة"
            value={
              data?.current_batch?.name ||
              data?.data?.current_batch?.name ||
              student?.batch?.name ||
              "—"
            }
          />
          <SummaryItem
            label="المبلغ الكلي"
            value={summary ? `${summary.total_amount_usd}$` : "—"}
          />
          <SummaryItem
            label="المبلغ المتبقي"
            value={summary ? `${summary.remaining_amount_usd}$` : "—"}
          />
          <SummaryItem
            label="نسبة الحسم"
            value={summary ? `%${summary.discount_percentage}` : "—"}
          />
        </div>
      </div>

      {/* ================= جدول / كروت الدفعات ================= */}
      {!filteredPayments.length ? (
        <div className="py-8 text-center text-gray-400">
          لا توجد دفعات في هذا التاريخ.
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-pink-50 text-gray-700">
                    <th className="p-3 rounded-r-xl">#</th>
                    <th className="p-3">تاريخ الدفع</th>
                    <th className="p-3">رقم الإيصال</th>
                    <th className="p-3 rounded-l-xl">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, index) => (
                    <tr
                      key={p.id ?? index}
                      className="bg-white hover:bg-pink-50 transition"
                    >
                      <td className="p-3 rounded-r-xl font-medium">
                        {index + 1}
                      </td>
                      <td className="p-3">{p.payment_date || "—"}</td>
                      <td className="p-3">{p.receipt_number || "—"}</td>
                      <td className="p-3 rounded-l-xl font-semibold">
                        {p.amount_usd ? `${p.amount_usd}$` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {filteredPayments.map((p, index) => (
              <div
                key={p.id ?? index}
                className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
              >
                <Item label="الدفعة" value={`#${index + 1}`} />
                <Item label="تاريخ الدفع" value={p.payment_date || "—"} />
                <Item label="رقم الإيصال" value={p.receipt_number || "—"} />
                <Item
                  label="المبلغ"
                  value={p.amount_usd ? `${p.amount_usd}$` : "—"}
                  bold
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ================= Components ================= */

function SummaryItem({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 whitespace-nowrap">{label}:</span>
      <span className="text-sm font-semibold text-gray-800 truncate">
        {value}
      </span>
    </div>
  );
}

function Item({ label, value, bold }) {
  return (
    <div className="flex justify-between mb-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} text-gray-800`}>
        {value}
      </span>
    </div>
  );
}
