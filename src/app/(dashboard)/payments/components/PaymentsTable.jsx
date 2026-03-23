"use client";

import { useMemo, useState } from "react";
import DataTable from "@/components/common/DataTable";
import ActionsMenu from "@/components/common/ActionsMenu";

/* ================= Helpers ================= */

const getRowId = (row) =>
  String(
    row?.payment_id ??
      row?.id ??
      row?.installment_id ??
      `${row?.student_id ?? "s"}-${row?.due_date ?? row?.paid_date ?? "d"}`
  );

const moneyLabel = (row) => {
  const amount = row?.amount;
  if (amount !== undefined && amount !== null && String(amount) !== "")
    return `${amount}$`;

  const usd = row?.amount_usd ?? row?.amountUsd ?? row?.amount;
  if (usd !== undefined && usd !== null && String(usd) !== "") return `${usd}$`;

  const syp = row?.amount_syp ?? row?.amountSyp;
  if (syp !== undefined && syp !== null && String(syp) !== "")
    return `${syp} ل.س`;

  return "—";
};

const receiptLabel = (row) =>
  row?.receipt_number ??
  row?.receipt_no ??
  row?.voucher_number ??
  row?.payment_id ??
  row?.installment_id ??
  "—";

const fullNameLabel = (row, mode) => {
  if (mode === "late") return row?.student_name ?? "—";

  const full = `${row?.first_name ?? ""} ${row?.last_name ?? ""}`.trim();
  return full || row?.student_name || "—";
};

/* ================= Component ================= */

export default function PaymentsTable({
  mode = "latest", // latest | late
  rows = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,
  pendingMap = {},
  onViewDetails,
  onEdit,
  onDelete,
  onOpenStudentPaymentsFromLate,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const columns = useMemo(() => {
    const cols = [
      {
        header: "رقم الإيصال",
        key: "receipt_number",
        render: (_, row) => {
          const pid = row?.payment_id ?? row?.id ?? row?.installment_id;
          const pending = pendingMap?.[String(pid)];
          return (
            <div className="flex items-center gap-2 font-medium">
              <span>{receiptLabel(row)}</span>
              {pending && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    pending.type === "delete"
                      ? "bg-red-100 text-red-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {pending.type === "delete"
                    ? "طلب حذف معلّق"
                    : "طلب تعديل معلّق"}
                </span>
              )}
            </div>
          );
        },
      },
    ];

    if (mode === "late") {
      cols.push({
        header: "الاسم الكامل",
        key: "student_name",
        render: (_, row) => (
          <span className="font-medium">{fullNameLabel(row, mode)}</span>
        ),
      });
    } else {
      cols.push(
        {
          header: "الاسم",
          key: "first_name",
          render: (val) => <span className="font-medium">{val || "—"}</span>,
        },
        { 
          header: "الكنية", 
          key: "last_name" 
        }
      );
    }

    cols.push(
      {
        header: mode === "latest" ? "الدفعة" : "القسط/المبلغ",
        key: "amount",
        render: (_, row) => moneyLabel(row),
      },
      {
        header: mode === "latest" ? "تاريخ الدفع" : "تاريخ الاستحقاق",
        key: mode === "latest" ? "paid_date" : "due_date",
        render: (val) => val || "—",
      },
      {
        header: "ملاحظة",
        key: "note",
        render: (val, row) => val ?? row.description ?? "—",
      }
    );

    return cols;
  }, [mode, pendingMap]);

  const menuItems = useMemo(() => {
    return (row) => {
      if (mode === "late") return [];
      return [
        { label: "عرض تفاصيل الدفعة", onClick: () => onViewDetails?.(row) },
        { label: "تعديل الدفعة", onClick: () => onEdit?.(row) },
        { label: "حذف", danger: true, onClick: () => onDelete?.(row) },
      ];
    };
  }, [mode, onViewDetails, onEdit, onDelete]);

  const renderActions = (row, isMobile) => {
    if (mode === "late") return null;
    const id = getRowId(row);
    return (
      <ActionsMenu
        menuId={`payment-${isMobile ? "m-" : ""}${id}`}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        items={menuItems(row)}
      />
    );
  };

  return (
    <DataTable
      data={rows}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={mode === "late" ? null : renderActions}
      getRowId={getRowId}
      pageSize={8}
      emptyMessage={
        mode === "latest" ? "لا يوجد دفعات." : "لا يوجد طلاب متأخرين."
      }
    />
  );
}
