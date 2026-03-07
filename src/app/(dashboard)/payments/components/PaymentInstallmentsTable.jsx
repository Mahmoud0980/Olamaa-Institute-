"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import ActionsMenu from "@/components/common/ActionsMenu";

/* ================= Helpers ================= */

const rowId = (row) =>
  String(
    row?.id ??
      row?.installment_id ??
      `${row?.enrollment_contract_id ?? "c"}-${row?.installment_number ?? "n"}-${
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
  onEdit,
  onDelete,
}) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(safeRows.length / pageSize) || 1;
  const paginated = safeRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [safeRows.length]);
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const toggleSelect = (row) => {
    if (!onSelectChange) return;

    const id = rowId(row);
    const updated = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];

    onSelectChange(updated);
  };

  const [openMenuId, setOpenMenuId] = useState(null);

  const menuItems = useMemo(() => {
    return (row) => [
      {
        label: "تعديل القسط",
        onClick: () => onEdit?.(row),
      },
      {
        label: "حذف",
        danger: true,
        onClick: () => onDelete?.(row),
      },
    ];
  }, [onEdit, onDelete]);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا يوجد أقساط.</div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">رقم العقد</th>
                  <th className="p-3">رقم القسط</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">تاريخ الاستحقاق</th>
                  <th className="p-3">سعر الصرف</th>
                  <th className="p-3">الحالة</th>
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

                      <td className="p-3 font-medium">
                        {row?.enrollment_contract_id ?? "—"}
                      </td>

                      <td className="p-3">{row?.installment_number ?? "—"}</td>

                      <td className="p-3">{moneyLabel(row)}</td>

                      <td className="p-3">{row?.due_date ?? "—"}</td>

                      <td className="p-3">
                        {row?.exchange_rate_at_due_date ?? "—"}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${statusClass(
                            row?.status,
                          )}`}
                        >
                          {statusLabel(row?.status)}
                        </span>
                      </td>

                      <td className="p-3 text-center rounded-l-xl">
                        <div className="relative inline-block">
                          <ActionsMenu
                            menuId={`installment-${id}`}
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

          {/* MOBILE */}
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
                      menuId={`installment-m-${id}`}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      items={menuItems(row)}
                    />
                  </div>

                  <Info
                    label="رقم العقد"
                    value={row?.enrollment_contract_id ?? "—"}
                  />
                  <Info
                    label="رقم القسط"
                    value={row?.installment_number ?? "—"}
                  />
                  <Info label="المبلغ" value={moneyLabel(row)} />
                  <Info label="تاريخ الاستحقاق" value={row?.due_date ?? "—"} />
                  <Info
                    label="سعر الصرف"
                    value={row?.exchange_rate_at_due_date ?? "—"}
                  />
                  <Info label="الحالة" value={statusLabel(row?.status)} />
                </div>
              );
            })}
          </div>

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

function Info({ label, value }) {
  return (
    <div className="flex justify-between mb-2 gap-3">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-left">{value ?? "—"}</span>
    </div>
  );
}
