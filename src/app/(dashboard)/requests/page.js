"use client";

import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import Breadcrumb from "@/components/common/Breadcrumb";
import ActionsRow from "@/components/common/ActionsRow";
import DataTable from "@/components/common/DataTable";
import PrintExportActions from "@/components/common/PrintExportActions";

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

/* ====== GRADES format ====== */
function gradeActionLabel(t) {
  const v = String(t || "").toLowerCase();
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
  const rid = r?.exam_result_id ?? r?.exam_result?.id ?? r?.original_data?.id ?? "—";
  const student = studentNameFromReq(r);
  const examName = examNameFromReq(r);

  const proposed = r?.proposed_changes && typeof r.proposed_changes === "object" ? r.proposed_changes : {};
  const original = r?.original_data && typeof r.original_data === "object" ? r.original_data : {};

  const changesKeys = Object.keys(proposed);
  const changesText =
    changesKeys.length === 0
      ? ""
      : changesKeys
          .map((k) => {
            const before = original?.[k];
            const after = proposed?.[k];
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
  const [section, setSection] = useState("payments");

  // ====== Counts (pending) ======
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
    return arr.filter((x) => String(x?.status).toLowerCase() === "pending").length;
  }, [payPendingRes]);

  const gradesPendingCount = useMemo(() => {
    const arr = toArray(gradesPendingRes);
    return arr.filter((x) => String(x?.status).toLowerCase() === "pending").length;
  }, [gradesPendingRes]);

  // ====== Section list ======
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
  const [approvePayment, { isLoading: approvingPayment }] = useApprovePaymentEditRequestMutation();
  const [rejectPayment, { isLoading: rejectingPayment }] = useRejectPaymentEditRequestMutation();
  const [approveGrade, { isLoading: approvingGrade }] = useApproveExamResultEditRequestMutation();
  const [rejectGrade, { isLoading: rejectingGrade }] = useRejectExamResultEditRequestMutation();

  const approving = approvingPayment || approvingGrade;
  const rejecting = rejectingPayment || rejectingGrade;

  const items = useMemo(() => {
    const q = String(search || "").trim().toLowerCase();
    const base = section === "payments" ? toArray(payAllRes) : section === "grades" ? toArray(gradesAllRes) : [];
    if (!q) return base;
    return base.filter((x) => {
      if (section === "payments") {
        const name = `${x?.requester?.full_name ?? x?.requester_name ?? ""}`.toLowerCase();
        const msg = `${x?.reason ?? ""} ${x?.action ?? ""}`.toLowerCase();
        return name.includes(q) || msg.includes(q);
      }
      if (section === "grades") {
        const msg = formatGradeReqText(x).toLowerCase();
        return msg.includes(q);
      }
      return false;
    });
  }, [section, payAllRes, gradesAllRes, search]);

  const handleRefresh = () => {
    if (section === "payments") refetchPayments?.();
    if (section === "grades") refetchGrades?.();
    refetchPayPending?.();
    refetchGradesPending?.();
    notify.success("تم التحديث");
  };

  const handleApprove = async (row) => {
    try {
      if (section === "payments") await approvePayment(row.id).unwrap();
      else if (section === "grades") await approveGrade(row.id).unwrap();
      notify.success("تمت الموافقة على الطلب");
      handleRefresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الموافقة");
    }
  };

  const handleReject = async (row) => {
    try {
      if (section === "payments") await rejectPayment(row.id).unwrap();
      else if (section === "grades") await rejectGrade(row.id).unwrap();
      notify.success("تم رفض الطلب");
      handleRefresh();
    } catch (e) {
      notify.error(e?.data?.message || "فشل الرفض");
    }
  };

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [section, search]);

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

  const columns = useMemo(() => [
    { 
      header: "الاسم", 
      key: "requester_id",
      render: (_, row) => {
        if (section === "payments") {
          return row?.requester?.full_name ?? row?.requester_name ?? `مستخدم #${row?.requester_id ?? "—"}`;
        }
        return `مستخدم #${row?.requester_id ?? "—"}`;
      }
    },
    { 
      header: "التاريخ", 
      key: "created_at",
      render: (val, row) => val || row?.updated_at || "—"
    },
    { 
      header: "تفاصيل الطلب", 
      key: "id",
      render: (_, row) => {
        if (section === "payments") {
          return `${paymentActionLabel(row?.action)} — ${row?.message ?? row?.reason ?? ""}`.trim();
        }
        return formatGradeReqText(row);
      }
    },
    { 
      header: "الحالة", 
      key: "status",
      className: "text-center",
      render: (val) => {
        const st = statusBadge(val);
        return <span className={st.cls}>{st.text}</span>;
      }
    },
  ], [section]);

  const renderActions = (row) => {
    const disabled = String(row?.status).toLowerCase() !== "pending";
    return (
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
    );
  };

  const exportColumns = useMemo(() => [
    { 
      header: "الاسم", 
      key: "requester_id",
      render: (_, row) => {
        if (section === "payments") {
          return row?.requester?.full_name ?? row?.requester_name ?? `مستخدم #${row?.requester_id ?? "—"}`;
        }
        return `مستخدم #${row?.requester_id ?? "—"}`;
      }
    },
    { header: "التاريخ", key: "created_at" },
    { 
      header: "التفاصيل", 
      key: "id",
      render: (_, row) => {
        if (section === "payments") {
          return `${paymentActionLabel(row?.action)} — ${row?.message ?? row?.reason ?? ""}`.trim();
        }
        return formatGradeReqText(row);
      }
    },
    { 
      header: "الحالة", 
      key: "status",
      render: (val) => statusBadge(val).text
    },
  ], [section]);

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
            loadingPayPending || fetchingPayPending || loadingGradesPending || fetchingGradesPending
              ? "جارٍ التحديث..."
              : "تحديث"
          }
          onViewAll={handleRefresh}
        />
        <div className="flex gap-2">
          {section !== "attendance" && (
            <PrintExportActions 
              data={items}
              selectedIds={selectedIds}
              columns={exportColumns}
              title={`سجل طلبات: ${section === "payments" ? "الدفعات" : "العلامات"}`}
              filename={`سجل_الطلبات_${section}`}
            />
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
        {section === "attendance" ? (
          <div className="py-10 text-center text-gray-400">قسم الحضور والغياب لاحقاً.</div>
        ) : (
          <DataTable
            data={items}
            columns={columns}
            isLoading={loading}
            showCheckbox={true}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            pageSize={7}
            renderActions={renderActions}
            emptyMessage="لا توجد طلبات."
          />
        )}
      </div>
    </div>
  );
}
