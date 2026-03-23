"use client";

import { useMemo } from "react";
import DataTable from "@/components/common/DataTable";

/* ================= Helpers ================= */

const rowId = (row) =>
  String(
    row?.id ??
      row?.installment_id ??
      `${row?.student_id ?? "s"}-${row?.installment_number ?? "n"}-${
        row?.due_date ?? "d"
      }`,
  );

const moneyLabel = (row) => {
  const usd =
    row?.planned_amount_usd ??
    row?.amount_usd ??
    row?.plannedUsd ??
    row?.amountUsd;

  const syp =
    row?.planned_amount_syp ??
    row?.amount_syp ??
    row?.plannedSyp ??
    row?.amountSyp;

  if (usd && syp) return `${usd}$ / ${syp} ل.س`;
  if (usd) return `${usd}$`;
  if (syp) return `${syp} ل.س`;
  return "—";
};

const statusLabel = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "مدفوع";
  if (s === "overdue") return "متأخر";
  if (s === "pending") return "معلّق";
  return status || "—";
};

const statusClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "bg-green-100 text-green-700";
  if (s === "overdue") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

/* ================= Component ================= */

export default function PaymentInstallmentsTable({
  rows = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,
}) {
  const columns = useMemo(
    () => [
      {
        header: "اسم الطالب",
        key: "student_name",
        render: (val) => val || "—",
      },
      {
        header: "رقم القسط",
        key: "installment_number",
        render: (val) => val ?? "—",
      },
      {
        header: "المبلغ",
        key: "id",
        render: (_, row) => moneyLabel(row),
      },
      {
        header: "تاريخ الاستحقاق",
        key: "due_date",
        render: (val) => val ?? "—",
      },
      {
        header: "سعر الصرف",
        key: "exchange_rate_at_due_date",
        render: (val) => val ?? "—",
      },
      {
        header: "الحالة",
        key: "status",
        render: (val) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${statusClass(val)}`}
          >
            {statusLabel(val)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={onSelectChange}
        getRowId={rowId}
        pageSize={8}
        emptyMessage="لا يوجد أقساط."
      />
    </div>
  );
}
