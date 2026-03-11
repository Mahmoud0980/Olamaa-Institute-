"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";

import {
  useGetPaymentEditRequestsQuery,
  useApproveEditRequestMutation,
  useRejectEditRequestMutation,
} from "@/store/services/editRequestsApi";

function normalizeArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

function StatusBadge({ status }) {
  // توقّع حالات: pending / approved / rejected
  const s = String(status || "").toLowerCase();

  const cls =
    s === "approved" || s === "accepted" || s === "مقبول"
      ? "bg-green-100 text-green-700"
      : s === "rejected" || s === "رفض" || s === "مرفوض"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-800";

  const label =
    s === "approved" || s === "accepted"
      ? "مقبول"
      : s === "rejected"
      ? "مرفوض"
      : "معلّق";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

export default function EditRequestsTable({ paymentId }) {
  const {
    data: res,
    isLoading,
    isFetching,
  } = useGetPaymentEditRequestsQuery(paymentId, { skip: !paymentId });

  const [approve, { isLoading: approving }] = useApproveEditRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectEditRequestMutation();

  const loading = isLoading || isFetching;

  // حسب swagger: "including payment details"
  // خلينا نفترض يرجع data: [requests...] أو data: {edit_requests:[]}
  const requests = useMemo(() => {
    const raw = res?.data ?? res;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.edit_requests)) return raw.edit_requests;
    if (Array.isArray(raw?.requests)) return raw.requests;
    return [];
  }, [res]);

  /* ================= Pagination ================= */
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const totalPages = Math.ceil(requests.length / pageSize) || 1;
  const paginated = requests.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [paymentId, requests.length]);

  const onApprove = async (row) => {
    const id = row?.id;
    if (!id) return;
    await approve(id).unwrap();
  };

  const onReject = async (row) => {
    const id = row?.id;
    if (!id) return;
    await reject(id).unwrap();
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {loading ? (
        <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">
          لا يوجد طلبات تعديل لهذه الدفعة.
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">رسالة السجل</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-center rounded-l-xl">إجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row, idx) => {
                  const status = row?.status ?? row?.state; // pending/approved/rejected
                  const isPending =
                    String(status || "").toLowerCase() === "pending" ||
                    String(status || "") === "معلق" ||
                    String(status || "") === "معلّق";

                  const date =
                    row?.created_at ?? row?.date ?? row?.requested_at ?? "—";

                  const message =
                    row?.message ??
                    row?.note ??
                    row?.reason ??
                    row?.description ??
                    "—";

                  return (
                    <tr
                      key={row?.id ?? `${idx}`}
                      className="bg-white hover:bg-pink-50 transition"
                    >
                      <td className="p-3 text-center rounded-r-xl">
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      <td className="p-3">{date}</td>
                      <td className="p-3">{message}</td>

                      <td className="p-3">
                        <StatusBadge status={status} />
                      </td>

                      <td className="p-3 text-center rounded-l-xl">
                        {isPending ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => onApprove(row)}
                              disabled={approving || rejecting}
                              className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white disabled:opacity-50"
                            >
                              قبول
                            </button>
                            <button
                              type="button"
                              onClick={() => onReject(row)}
                              disabled={approving || rejecting}
                              className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white disabled:opacity-50"
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((row, idx) => {
              const status = row?.status ?? row?.state;
              const isPending =
                String(status || "").toLowerCase() === "pending";

              const date =
                row?.created_at ?? row?.date ?? row?.requested_at ?? "—";

              const message =
                row?.message ??
                row?.note ??
                row?.reason ??
                row?.description ??
                "—";

              return (
                <div
                  key={row?.id ?? `${idx}`}
                  className="border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500">
                      #{(page - 1) * pageSize + idx + 1}
                    </span>
                    <StatusBadge status={status} />
                  </div>

                  <div className="text-sm text-gray-700 mb-2">{message}</div>
                  <div className="text-xs text-gray-500">{date}</div>

                  {isPending && (
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => onApprove(row)}
                        disabled={approving || rejecting}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-green-600 text-white disabled:opacity-50"
                      >
                        قبول
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(row)}
                        disabled={approving || rejecting}
                        className="flex-1 px-3 py-2 rounded-lg text-sm bg-red-600 text-white disabled:opacity-50"
                      >
                        رفض
                      </button>
                    </div>
                  )}
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
