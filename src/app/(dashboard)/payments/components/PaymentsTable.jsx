"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import ActionsMenu from "@/components/common/ActionsMenu";

/* ================= Helpers ================= */

const rowId = (row) =>
  String(
    row?.payment_id ??
      row?.id ??
      row?.installment_id ??
      `${row?.student_id ?? "s"}-${row?.due_date ?? row?.paid_date ?? "d"}`
  );

const moneyLabel = (row) => {
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
  "—";

/* ================= Component ================= */

export default function PaymentsTable({
  mode = "latest", // latest | late
  rows = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,

  onViewDetails,
  onEdit,
  onDelete,

  // للـ late mode
  onOpenStudentPaymentsFromLate,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  /* ================= Pagination ================= */
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(safeRows.length / pageSize) || 1;
  const paginated = safeRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [safeRows.length, mode]);
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  /* ================= Selection ================= */
  const toggleSelect = (row) => {
    if (!onSelectChange) return;

    const id = rowId(row);
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];

    onSelectChange(updated);
  };

  /* ================= ActionsMenu ================= */
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuItems = useMemo(() => {
    return (row) => {
      if (mode === "late") {
        return [
          {
            label: "عرض دفعات الطالب",
            onClick: () => onOpenStudentPaymentsFromLate?.(row),
          },
        ];
      }

      return [
        {
          label: "عرض تفاصيل الدفعة",
          onClick: () => onViewDetails?.(row),
        },

        {
          label: "تعديل الدفعة",
          onClick: () => onEdit?.(row),
        },
        {
          label: "حذف",
          danger: true,
          onClick: () => onDelete?.(row),
        },
      ];
    };
  }, [mode, onViewDetails, onEdit, onDelete, onOpenStudentPaymentsFromLate]);

  /* ================= Render ================= */
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">
          {mode === "latest" ? "لا يوجد دفعات." : "لا يوجد طلاب متأخرين."}
        </div>
      ) : (
        <>
          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">رقم الإيصال</th>
                  <th className="p-3">الاسم</th>
                  <th className="p-3">الكنية</th>
                  <th className="p-3">
                    {mode === "latest" ? "الدفعة" : "القسط/المبلغ"}
                  </th>
                  <th className="p-3">
                    {mode === "latest" ? "تاريخ الدفع" : "تاريخ الاستحقاق"}
                  </th>
                  <th className="p-3">ملاحظة</th>
                  <th className="p-3 text-center rounded-l-xl">
                    خيارات إضافية
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row, index) => {
                  const id = rowId(row);
                  return (
                    <tr
                      key={id}
                      className="bg-white hover:bg-pink-50 transition"
                    >
                      <td className="p-3 text-center rounded-r-xl">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-[#6F013F]"
                            checked={selectedIds.includes(id)}
                            onChange={() => toggleSelect(row)}
                          />
                          <span>{(page - 1) * pageSize + index + 1}</span>
                        </div>
                      </td>

                      <td className="p-3 font-medium">{receiptLabel(row)}</td>

                      <td className="p-3 font-medium">
                        {row.first_name ?? "—"}
                      </td>

                      <td className="p-3">{row.last_name ?? "—"}</td>

                      <td className="p-3">{moneyLabel(row)}</td>

                      <td className="p-3">
                        {mode === "latest"
                          ? row.paid_date ?? "—"
                          : row.due_date ?? "—"}
                      </td>

                      <td className="p-3">
                        {row.note ?? row.description ?? "—"}
                      </td>

                      <td className="p-3 text-center rounded-l-xl">
                        <div className="relative inline-block">
                          <ActionsMenu
                            menuId={`payment-${id}`}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                            items={menuItems(row)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((row, index) => {
              const id = rowId(row);
              return (
                <div
                  key={id}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">#</span>
                      <span className="font-semibold">
                        {(page - 1) * pageSize + index + 1}
                      </span>
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#6F013F]"
                        checked={selectedIds.includes(id)}
                        onChange={() => toggleSelect(row)}
                      />
                    </div>

                    <ActionsMenu
                      menuId={`payment-m-${id}`}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      items={menuItems(row)}
                    />
                  </div>

                  <Info label="رقم الإيصال" value={receiptLabel(row)} />
                  <Info label="الاسم" value={row.first_name} />
                  <Info label="الكنية" value={row.last_name} />
                  <Info
                    label={mode === "latest" ? "الدفعة" : "القسط/المبلغ"}
                    value={moneyLabel(row)}
                  />
                  <Info
                    label={
                      mode === "latest" ? "تاريخ الدفع" : "تاريخ الاستحقاق"
                    }
                    value={mode === "latest" ? row.paid_date : row.due_date}
                  />
                  <Info label="ملاحظة" value={row.note ?? row.description} />
                </div>
              );
            })}
          </div>

          {/* ================= PAGINATION ================= */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

/* ================= Small Component ================= */

function Info({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
