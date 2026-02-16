"use client";

import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import { notify } from "@/lib/helpers/toastify";

import Breadcrumb from "@/components/common/Breadcrumb";
import ActionsRow from "@/components/common/ActionsRow";
import Pagination from "@/components/common/Pagination";

import {
  useGetPaymentEditRequestsQuery,
  useApprovePaymentEditRequestMutation,
  useRejectPaymentEditRequestMutation,
} from "@/store/services/paymentEditRequestsApi";

const normalizeArray = (res) =>
  Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

const statusBadge = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "approved") return { text: "مقبول", cls: "text-green-600" };
  if (v === "rejected") return { text: "مرفوض", cls: "text-red-600" };
  return { text: "معلق", cls: "text-orange-500" };
};

const actionLabel = (a) => {
  const v = String(a || "").toLowerCase();
  if (v === "delete") return "حذف دفعة";
  if (v === "update") return "تعديل دفعة";
  return v || "—";
};

const safe = (v) =>
  v === undefined || v === null || String(v) === "" ? "—" : v;

export default function EditRequestsPage() {
  const search = useSelector((s) => s.search.values?.activity || "");
  const [section, setSection] = useState("payments"); // payments | grades | attendance

  const {
    data: res,
    isLoading,
    isFetching,
    refetch,
  } = useGetPaymentEditRequestsQuery(undefined, {
    skip: section !== "payments",
  });

  const loading = isLoading || isFetching;

  const items = useMemo(() => {
    const base = normalizeArray(res);
    const q = String(search || "")
      .trim()
      .toLowerCase();

    if (!q) return base;

    return base.filter((x) => {
      const name = `${
        x?.requester?.full_name ?? x?.requester_name ?? ""
      }`.toLowerCase();
      const msg = `${x?.reason ?? ""} ${x?.action ?? ""}`.toLowerCase();
      return name.includes(q) || msg.includes(q);
    });
  }, [res, search]);

  const [page, setPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginated = items.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [section, items.length]);

  const [approve, { isLoading: approving }] =
    useApprovePaymentEditRequestMutation();
  const [reject, { isLoading: rejecting }] =
    useRejectPaymentEditRequestMutation();

  const handleApprove = async (row) => {
    try {
      await approve(row.id).unwrap();
      notify.success("تمت الموافقة على الطلب");
    } catch (e) {
      notify.error(e?.data?.message || "فشل الموافقة");
    }
  };

  const handleReject = async (row) => {
    try {
      await reject(row.id).unwrap();
      notify.success("تم رفض الطلب");
    } catch (e) {
      notify.error(e?.data?.message || "فشل الرفض");
    }
  };

  const extraButtons = [
    {
      key: "payments",
      label: "عرض الدفعات",
      onClick: () => setSection("payments"),
      color: section === "payments" ? "pink" : "green",
    },
    {
      key: "grades",
      label: "عرض العلامات",
      onClick: () => {
        setSection("grades");
        notify.info("صفحة العلامات رح تنعمل بعد الدفعات");
      },
      color: section === "grades" ? "pink" : "green",
    },
    {
      key: "attendance",
      label: "عرض الحضور والغياب",
      onClick: () => {
        setSection("attendance");
        notify.info("صفحة الحضور والغياب رح تنعمل بعد الدفعات");
      },
      color: section === "attendance" ? "pink" : "green",
    },
  ];

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-700">سجل النشاطات</h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <ActionsRow
          viewLabel=""
          addLabel=""
          onAdd={null}
          extraButtons={extraButtons}
          showViewAll
          viewAllLabel="تحديث"
          onViewAll={() => refetch()}
        />
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
        {section !== "payments" ? (
          <div className="py-10 text-center text-gray-400">
            اختر قسم الدفعات لعرض الطلبات.
          </div>
        ) : loading ? (
          <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
        ) : !items.length ? (
          <div className="py-10 text-center text-gray-400">لا توجد طلبات.</div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-pink-50 text-gray-700">
                    <th className="p-3">الاسم</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">رسالة السجل</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((row) => {
                    const st = statusBadge(row?.status);
                    const created = row?.created_at || row?.updated_at || "—";
                    const name =
                      row?.requester?.full_name ??
                      row?.requester_name ??
                      `مستخدم #${row?.requester_id ?? "—"}`;

                    const msg = `${actionLabel(row?.action)} — ${
                      row?.message ?? row?.reason ?? ""
                    }`.trim();

                    return (
                      <tr
                        key={row.id}
                        className="bg-white hover:bg-pink-50 transition"
                      >
                        <td className="p-3 font-medium">{safe(name)}</td>
                        <td className="p-3">{safe(created)}</td>
                        <td className="p-3 text-gray-600">{safe(msg)}</td>
                        <td className="p-3 text-center">
                          <span className={st.cls}>{st.text}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-3">
                            <button
                              type="button"
                              disabled={
                                approving ||
                                rejecting ||
                                String(row?.status).toLowerCase() !== "pending"
                              }
                              onClick={() => handleApprove(row)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs disabled:opacity-50"
                            >
                              موافقة
                            </button>

                            <button
                              type="button"
                              disabled={
                                approving ||
                                rejecting ||
                                String(row?.status).toLowerCase() !== "pending"
                              }
                              onClick={() => handleReject(row)}
                              className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs disabled:opacity-50"
                            >
                              رفض
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3 mt-3">
              {paginated.map((row) => {
                const st = statusBadge(row?.status);
                const created = row?.created_at || row?.updated_at || "—";
                const name =
                  row?.requester?.full_name ??
                  row?.requester_name ??
                  `مستخدم #${row?.requester_id ?? "—"}`;
                const msg = `${actionLabel(row?.action)} — ${
                  row?.message ?? row?.reason ?? ""
                }`.trim();

                return (
                  <div
                    key={row.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <div className="font-semibold">{safe(name)}</div>
                      <div className={st.cls}>{st.text}</div>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      {safe(created)}
                    </div>
                    <div className="text-sm text-gray-700">{safe(msg)}</div>

                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        disabled={
                          approving ||
                          rejecting ||
                          String(row?.status).toLowerCase() !== "pending"
                        }
                        onClick={() => handleApprove(row)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs disabled:opacity-50"
                      >
                        موافقة
                      </button>

                      <button
                        type="button"
                        disabled={
                          approving ||
                          rejecting ||
                          String(row?.status).toLowerCase() !== "pending"
                        }
                        onClick={() => handleReject(row)}
                        className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs disabled:opacity-50"
                      >
                        رفض
                      </button>
                    </div>
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
    </div>
  );
}
