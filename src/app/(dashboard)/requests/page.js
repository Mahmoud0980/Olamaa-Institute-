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

import {
  useGetExamResultEditRequestsQuery,
  useApproveExamResultEditRequestMutation,
  useRejectExamResultEditRequestMutation,
} from "@/store/services/examResultEditRequestsApi";

/* ================= Helpers ================= */

const toArray = (res) =>
  Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

const safe = (v) =>
  v === undefined || v === null || String(v) === "" ? "—" : v;

const statusBadge = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "approved") return { text: "مقبول", cls: "text-green-600" };
  if (v === "rejected") return { text: "مرفوض", cls: "text-red-600" };
  return { text: "معلق", cls: "text-orange-500" };
};

const safeCountLabel = (label, count) =>
  count > 0 ? `${label} (${count})` : label;

/* ====== PAYMENT format ====== */
const paymentActionLabel = (a) => {
  const v = String(a || "").toLowerCase();
  if (v === "delete") return "حذف دفعة";
  if (v === "update" || v === "edit") return "تعديل دفعة";
  return v || "—";
};

/* ====== GRADES format (based on your response) ====== */
function gradeActionLabel(t) {
  const v = String(t || "").toLowerCase(); // update | delete
  if (v === "delete") return "حذف علامة";
  return "تعديل علامة";
}

function studentNameFromReq(r) {
  const st = r?.exam_result?.student;
  const full = `${st?.first_name ?? ""} ${st?.last_name ?? ""}`.trim();
  return full || `طالب #${r?.exam_result?.student_id ?? "—"}`;
}

function examNameFromReq(r) {
  return (
    r?.exam_result?.exam?.name ?? `امتحان #${r?.exam_result?.exam_id ?? "—"}`
  );
}

function formatGradeReqText(r) {
  const action = gradeActionLabel(r?.type);
  const rid =
    r?.exam_result_id ?? r?.exam_result?.id ?? r?.original_data?.id ?? "—";

  const student = studentNameFromReq(r);
  const examName = examNameFromReq(r);

  // diff: proposed_changes مقارنةً بـ original_data
  const proposed =
    r?.proposed_changes && typeof r.proposed_changes === "object"
      ? r.proposed_changes
      : {};

  const original =
    r?.original_data && typeof r.original_data === "object"
      ? r.original_data
      : {};

  const changesKeys = Object.keys(proposed);
  const changesText =
    changesKeys.length === 0
      ? ""
      : changesKeys
          .map((k) => {
            const before = original?.[k];
            const after = proposed?.[k];
            // مثال: obtained_marks: 50 → 58
            return `${k}: ${safe(before)} → ${safe(after)}`;
          })
          .join(" | ");

  const reason = r?.reason ? ` — السبب: ${r.reason}` : "";

  return `${action} — نتيجة #${rid} — ${student} — ${examName}${
    changesText ? ` — ${changesText}` : ""
  }${reason}`.trim();
}

/* ================= Page ================= */

export default function RequestsPage() {
  const search = useSelector((s) => s.search.values?.activity || "");
  const [section, setSection] = useState("payments"); // payments | grades | attendance

  // ====== Counts (pending) - Always fetch to show badges ======
  const {
    data: payPendingRes,
    isLoading: loadingPayPending,
    isFetching: fetchingPayPending,
    refetch: refetchPayPending,
  } = useGetPaymentEditRequestsQuery(
    { status: "pending" },
    { pollingInterval: 10000, refetchOnFocus: true },
  );

  const {
    data: gradesPendingRes,
    isLoading: loadingGradesPending,
    isFetching: fetchingGradesPending,
    refetch: refetchGradesPending,
  } = useGetExamResultEditRequestsQuery(
    { status: "pending" },
    { pollingInterval: 10000, refetchOnFocus: true },
  );

  const payPendingCount = useMemo(() => {
    const arr = toArray(payPendingRes);
    return arr.filter((x) => String(x?.status).toLowerCase() === "pending")
      .length;
  }, [payPendingRes]);

  const gradesPendingCount = useMemo(() => {
    const arr = toArray(gradesPendingRes);
    return arr.filter((x) => String(x?.status).toLowerCase() === "pending")
      .length;
  }, [gradesPendingRes]);

  // ====== Section list (fetch only when active) ======
  const {
    data: payAllRes,
    isLoading: loadingPayments,
    isFetching: fetchingPayments,
    refetch: refetchPayments,
  } = useGetPaymentEditRequestsQuery(undefined, {
    skip: section !== "payments",
  });

  const {
    data: gradesAllRes,
    isLoading: loadingGrades,
    isFetching: fetchingGrades,
    refetch: refetchGrades,
  } = useGetExamResultEditRequestsQuery(undefined, {
    skip: section !== "grades",
  });

  const loading =
    (section === "payments" && (loadingPayments || fetchingPayments)) ||
    (section === "grades" && (loadingGrades || fetchingGrades));

  // ====== approve/reject mutations ======
  const [approvePayment, { isLoading: approvingPayment }] =
    useApprovePaymentEditRequestMutation();
  const [rejectPayment, { isLoading: rejectingPayment }] =
    useRejectPaymentEditRequestMutation();

  const [approveGrade, { isLoading: approvingGrade }] =
    useApproveExamResultEditRequestMutation();
  const [rejectGrade, { isLoading: rejectingGrade }] =
    useRejectExamResultEditRequestMutation();

  const approving = approvingPayment || approvingGrade;
  const rejecting = rejectingPayment || rejectingGrade;

  // ====== items based on section ======
  const items = useMemo(() => {
    const q = String(search || "")
      .trim()
      .toLowerCase();

    const base =
      section === "payments"
        ? toArray(payAllRes)
        : section === "grades"
          ? toArray(gradesAllRes)
          : [];

    if (!q) return base;

    return base.filter((x) => {
      if (section === "payments") {
        const name =
          `${x?.requester?.full_name ?? x?.requester_name ?? ""}`.toLowerCase();
        const msg = `${x?.reason ?? ""} ${x?.action ?? ""}`.toLowerCase();
        return name.includes(q) || msg.includes(q);
      }

      if (section === "grades") {
        // requester_name غير موجود بالـ response يلي بعته، ف منفلتر على نص الرسالة
        const msg = formatGradeReqText(x).toLowerCase();
        return msg.includes(q);
      }

      return false;
    });
  }, [section, payAllRes, gradesAllRes, search]);

  // ====== pagination ======
  const [page, setPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginated = items.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [section, items.length]);

  // ====== refresh ======
  const handleRefresh = () => {
    if (section === "payments") refetchPayments?.();
    if (section === "grades") refetchGrades?.();
    refetchPayPending?.();
    refetchGradesPending?.();
    notify.success("تم التحديث");
  };

  // ====== approve/reject handlers ======
  const handleApprove = async (row) => {
    try {
      if (section === "payments") {
        await approvePayment(row.id).unwrap();
      } else if (section === "grades") {
        await approveGrade(row.id).unwrap();
      }
      notify.success("تمت الموافقة على الطلب");
      handleRefresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الموافقة");
    }
  };

  const handleReject = async (row) => {
    try {
      if (section === "payments") {
        await rejectPayment(row.id).unwrap();
      } else if (section === "grades") {
        await rejectGrade(row.id).unwrap();
      }
      notify.success("تم رفض الطلب");
      handleRefresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الرفض");
    }
  };

  // ====== buttons with badges ======
  const extraButtons = [
    {
      key: "payments",
      label: safeCountLabel("عرض الدفعات", payPendingCount),
      onClick: () => setSection("payments"),
      color: section === "payments" ? "pink" : "green",
    },
    {
      key: "grades",
      label: safeCountLabel("عرض العلامات", gradesPendingCount),
      onClick: () => setSection("grades"),
      color: section === "grades" ? "pink" : "green",
    },
    {
      key: "attendance",
      label: safeCountLabel("عرض الحضور والغياب", 0),
      onClick: () => {
        setSection("attendance");
        notify.info("قسم الحضور والغياب لاحقاً");
      },
      color: section === "attendance" ? "pink" : "green",
    },
  ];

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-700">سجل الطلبات</h1>
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
          viewAllLabel={
            loadingPayPending ||
            fetchingPayPending ||
            loadingGradesPending ||
            fetchingGradesPending
              ? "جارٍ التحديث..."
              : "تحديث"
          }
          onViewAll={handleRefresh}
        />
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
        {section === "attendance" ? (
          <div className="py-10 text-center text-gray-400">
            قسم الحضور والغياب لاحقاً.
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
                    <th className="p-3">تفاصيل الطلب</th>
                    <th className="p-3 text-center">الحالة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.map((row) => {
                    const st = statusBadge(row?.status);
                    const created = row?.created_at || row?.updated_at || "—";

                    const name =
                      section === "payments"
                        ? (row?.requester?.full_name ??
                          row?.requester_name ??
                          `مستخدم #${row?.requester_id ?? "—"}`)
                        : `مستخدم #${row?.requester_id ?? "—"}`;

                    const msg =
                      section === "payments"
                        ? `${paymentActionLabel(row?.action)} — ${
                            row?.message ?? row?.reason ?? ""
                          }`.trim()
                        : formatGradeReqText(row);

                    const disabled =
                      String(row?.status).toLowerCase() !== "pending";

                    return (
                      <tr
                        key={`${section}-${row.id}`}
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
                              disabled={approving || rejecting || disabled}
                              onClick={() => handleApprove(row)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs disabled:opacity-50"
                            >
                              موافقة
                            </button>

                            <button
                              type="button"
                              disabled={approving || rejecting || disabled}
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

            {/* Mobile */}
            <div className="md:hidden space-y-3 mt-3">
              {paginated.map((row) => {
                const st = statusBadge(row?.status);
                const created = row?.created_at || row?.updated_at || "—";
                const disabled =
                  String(row?.status).toLowerCase() !== "pending";

                const name =
                  section === "payments"
                    ? (row?.requester?.full_name ??
                      row?.requester_name ??
                      `مستخدم #${row?.requester_id ?? "—"}`)
                    : `مستخدم #${row?.requester_id ?? "—"}`;

                const msg =
                  section === "payments"
                    ? `${paymentActionLabel(row?.action)} — ${
                        row?.message ?? row?.reason ?? ""
                      }`.trim()
                    : formatGradeReqText(row);

                return (
                  <div
                    key={`${section}-${row.id}`}
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
                        disabled={approving || rejecting || disabled}
                        onClick={() => handleApprove(row)}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs disabled:opacity-50"
                      >
                        موافقة
                      </button>

                      <button
                        type="button"
                        disabled={approving || rejecting || disabled}
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
