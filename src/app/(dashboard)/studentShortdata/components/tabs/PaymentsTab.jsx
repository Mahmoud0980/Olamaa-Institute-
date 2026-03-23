"use client";

import { useMemo, useState, useEffect } from "react";
import DataTable from "@/components/common/DataTable";
import { useGetStudentPaymentsSummaryQuery } from "@/store/services/studentPaymentsApi";
import PrintExportActions from "@/components/common/PrintExportActions";

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

export default function PaymentsTab({ student, paymentsRange }) {
  const { data, isLoading } = useGetStudentPaymentsSummaryQuery(student?.id, {
    skip: !student?.id,
  });

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

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [paymentsRange]);

  const columns = useMemo(() => [
    { 
      header: "تاريخ الدفع", 
      key: "payment_date",
      render: (_, row) => {
        const rawDate =
          row.payment_date ||
          row.date ||
          row.paid_at ||
          row.created_at ||
          row.updated_at;
        return toYMDFromAny(rawDate) || "—";
      }
    },
    { 
      header: "رقم الإيصال", 
      key: "receipt_number" 
    },
    { 
      header: "المبلغ", 
      key: "amount_usd",
      render: (val) => <span className="font-semibold">{val ? `${val}$` : "—"}</span>
    },
  ], []);

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

      <div className="flex justify-start">
        <PrintExportActions 
          data={paymentsFiltered}
          selectedIds={selectedIds}
          columns={[
            { 
              header: "تاريخ الدفع", 
              key: "payment_date",
              render: (_, row) => {
                const rawDate = row.payment_date || row.date || row.paid_at || row.created_at || row.updated_at;
                return toYMDFromAny(rawDate) || "—";
              }
            },
            { header: "رقم الإيصال", key: "receipt_number" },
            { 
              header: "المبلغ", 
              key: "amount_usd",
              render: (val) => (val ? `${val}$` : "—")
            },
          ]}
          title={`سجل دفعات الطالب: ${student?.full_name || "-"}`}
          filename={`دفعات_${student?.full_name || "طالب"}`}
        />
      </div>

      <DataTable
        data={paymentsFiltered}
        columns={columns}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        showCheckbox={true}
        pageSize={6}
        emptyMessage="لا توجد دفعات ضمن هذا المجال."
      />
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
