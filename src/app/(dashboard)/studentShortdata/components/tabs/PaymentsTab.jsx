"use client";

import { useMemo, useState, useEffect } from "react";
import { useGetStudentPaymentsSummaryQuery } from "@/store/services/studentPaymentsApi";
import Pagination from "@/components/common/Pagination"; // ✅ كمبوننت الباجينيشن تبعك

function toYMDFromAny(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toLocaleDateString("en-CA");
  return "";
}

function normalizeRange(start, end) {
  const a = toYMDFromAny(start);
  const b = toYMDFromAny(end);
  if (!a || !b) return { min: "", max: "" };
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

const PAGE_SIZE = 6;

export default function PaymentsTab({ student, paymentsRange }) {
  const { data, isLoading } = useGetStudentPaymentsSummaryQuery(student?.id, {
    skip: !student?.id,
  });

  const [page, setPage] = useState(1);

  const paymentsAll = useMemo(() => {
    if (Array.isArray(data?.payments)) return data.payments;
    if (Array.isArray(data?.data?.payments)) return data.data.payments;
    return [];
  }, [data]);

  const summary = useMemo(() => {
    const s =
      data?.contracts_summary?.[0] || data?.data?.contracts_summary?.[0];
    return s || null;
  }, [data]);

  const lastReceipt =
    paymentsAll.length > 0
      ? paymentsAll[paymentsAll.length - 1]?.receipt_number || "—"
      : "—";

  const paymentsFiltered = useMemo(() => {
    const start = paymentsRange?.start;
    const end = paymentsRange?.end;

    if (!start || !end) return paymentsAll;

    const { min, max } = normalizeRange(start, end);
    if (!min || !max) return paymentsAll;

    return paymentsAll.filter((p) => {
      const rawDate =
        p.payment_date || p.date || p.paid_at || p.created_at || p.updated_at;

      const ymd = toYMDFromAny(rawDate);
      if (!ymd) return false;

      return ymd >= min && ymd <= max;
    });
  }, [paymentsAll, paymentsRange]);

  // ✅ reset page لما تتغير الدفعات بعد الفلترة/تحميل
  useEffect(() => {
    setPage(1);
  }, [paymentsFiltered.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(paymentsFiltered.length / PAGE_SIZE),
  );

  const paymentsPaged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return paymentsFiltered.slice(start, start + PAGE_SIZE);
  }, [paymentsFiltered, page]);

  if (isLoading) {
    return (
      <div className="text-gray-500 text-sm text-center py-6">
        جاري تحميل الدفعات...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ملخص الدفعات */}
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

      {/* جدول الدفعات */}
      {!paymentsFiltered.length ? (
        <div className="py-8 text-center text-gray-400">
          لا توجد دفعات ضمن هذا المجال.
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
                  {paymentsPaged.map((p, index) => {
                    const rawDate =
                      p.payment_date ||
                      p.date ||
                      p.paid_at ||
                      p.created_at ||
                      p.updated_at;

                    const globalIndex = (page - 1) * PAGE_SIZE + index + 1;

                    return (
                      <tr
                        key={p.id ?? `${page}-${index}`}
                        className="bg-white hover:bg-pink-50 transition"
                      >
                        <td className="p-3 rounded-r-xl font-medium">
                          {globalIndex}
                        </td>
                        <td className="p-3">{toYMDFromAny(rawDate) || "—"}</td>
                        <td className="p-3">{p.receipt_number || "—"}</td>
                        <td className="p-3 rounded-l-xl font-semibold">
                          {p.amount_usd ? `${p.amount_usd}$` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hideIfSinglePage
              siblingCount={1}
              className="mt-4"
            />
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {paymentsPaged.map((p, index) => {
              const rawDate =
                p.payment_date ||
                p.date ||
                p.paid_at ||
                p.created_at ||
                p.updated_at;

              const globalIndex = (page - 1) * PAGE_SIZE + index + 1;

              return (
                <div
                  key={p.id ?? `${page}-${index}`}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between mb-2 text-xs text-gray-500">
                    <span>الدفعة</span>
                    <span className="font-semibold text-gray-800">
                      #{globalIndex}
                    </span>
                  </div>
                  <Item
                    label="تاريخ الدفع"
                    value={toYMDFromAny(rawDate) || "—"}
                  />
                  <Item label="رقم الإيصال" value={p.receipt_number || "—"} />
                  <Item
                    label="المبلغ"
                    value={p.amount_usd ? `${p.amount_usd}$` : "—"}
                    bold
                  />
                </div>
              );
            })}

            {/* ✅ Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hideIfSinglePage
              siblingCount={1}
              className="mt-4"
            />
          </div>
        </>
      )}
    </div>
  );
}

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
