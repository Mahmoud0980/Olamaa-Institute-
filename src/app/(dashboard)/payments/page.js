"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { notify } from "@/lib/helpers/toastify";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";
import SearchableSelect from "@/components/common/SearchableSelect";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import PaymentsTable from "./components/PaymentsTable";
import PaymentsTableSkeleton from "./components/PaymentsTableSkeleton";
import PaymentAddModal from "./components/PaymentAddModal";
import PaymentDetailsModal from "./components/PaymentDetailsModal";
import PaymentInstallmentAddModal from "./components/PaymentInstallmentAddModal";
import PaymentInstallmentsTable from "./components/PaymentInstallmentsTable";

import { useGetBatchesQuery } from "@/store/services/batchesApi";
import { useGetStudentsDetailsQuery } from "@/store/services/studentsApi";

import {
  useGetLatestPaymentsPerStudentQuery,
  useGetStudentLatePaymentsQuery,
  useGetPaymentByIdQuery,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} from "@/store/services/paymentsApi";

import {
  useGetPaymentInstallmentsQuery,
  useGetPaymentInstallmentByIdQuery,
  useAddPaymentInstallmentMutation,
  useUpdatePaymentInstallmentMutation,
  useDeletePaymentInstallmentMutation,
} from "@/store/services/paymentInstallmentsApi";

/* ================= Helpers ================= */
const studentNameLabel = (row) => row?.student_name ?? "—";
const paymentStudentFullName = (row, mode) => {
  if (mode === "late") return row?.student_name ?? "—";

  const full = `${row?.first_name ?? ""} ${row?.last_name ?? ""}`.trim();
  return full || row?.student_name || "—";
};
function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

function normalizeObject(res) {
  if (res?.data && typeof res.data === "object") return res.data;
  if (typeof res === "object" && res !== null) return res;
  return null;
}

const paymentRowId = (r) =>
  String(
    r?.payment_id ??
      r?.id ??
      r?.installment_id ??
      `${r?.student_id ?? "s"}-${r?.paid_date ?? r?.due_date ?? "d"}`,
  );

const installmentRowId = (r) =>
  String(
    r?.id ??
      r?.installment_id ??
      `${r?.enrollment_contract_id ?? "c"}-${r?.installment_number ?? "n"}-${
        r?.due_date ?? "d"
      }`,
  );

const paymentMoneyLabel = (r) => {
  if (
    r?.amount !== undefined &&
    r?.amount !== null &&
    String(r?.amount) !== ""
  ) {
    return `${r.amount}$`;
  }

  const c = String(r?.currency || "").toUpperCase();

  if (c === "SYP") {
    const s = r?.amount_syp ? `${r.amount_syp} ل.س` : "—";
    const u = r?.amount_usd ? ` (≈ ${r.amount_usd}$)` : "";
    return s + u;
  }

  if (c === "USD") {
    return r?.amount_usd ? `${r.amount_usd}$` : "—";
  }

  if (r?.amount_syp && r?.amount_usd)
    return `${r.amount_syp} ل.س (≈ ${r.amount_usd}$)`;

  if (r?.amount_syp) return `${r.amount_syp} ل.س`;
  if (r?.amount_usd) return `${r.amount_usd}$`;
  return "—";
};

const installmentMoneyLabel = (r) => {
  const usd =
    r?.planned_amount_usd ?? r?.amount_usd ?? r?.plannedUsd ?? r?.amountUsd;
  const syp =
    r?.planned_amount_syp ?? r?.amount_syp ?? r?.plannedSyp ?? r?.amountSyp;

  if (usd && syp) return `${usd}$ / ${syp} ل.س`;
  if (usd) return `${usd}$`;
  if (syp) return `${syp} ل.س`;
  return "—";
};

const installmentStatusLabel = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "مدفوع";
  if (s === "overdue") return "متأخر";
  if (s === "pending") return "معلّق";
  return status || "—";
};

export default function PaymentsPage() {
  const [viewType, setViewType] = useState("payments"); // payments | installments
  const [mode, setMode] = useState("latest"); // latest | late (only for payments)
  const [pendingMap, setPendingMap] = useState({});

  const search = useSelector((s) => s.search.values.payments || "");
  const branchId = useSelector((s) => s.search.values.branch || "");

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const students = useMemo(() => normalizeArray(studentsRes), [studentsRes]);

  const { data: batchesRes } = useGetBatchesQuery();
  const batches = useMemo(() => normalizeArray(batchesRes), [batchesRes]);

  /* ================= Payments Queries ================= */

  const { data: latestRes, isLoading: loadingLatest } =
    useGetLatestPaymentsPerStudentQuery(undefined, {
      skip: viewType !== "payments",
    });

  const { data: lateRes, isLoading: loadingLate } =
    useGetStudentLatePaymentsQuery(undefined, {
      skip: viewType !== "payments",
    });

  /* ================= Installments Queries ================= */

  const { data: installmentsRes, isLoading: loadingInstallments } =
    useGetPaymentInstallmentsQuery(undefined, {
      skip: viewType !== "installments",
    });

  /* ================= Loading ================= */

  const loading =
    viewType === "payments"
      ? mode === "latest"
        ? loadingLatest
        : loadingLate
      : loadingInstallments;

  /* ================= Payments Rows ================= */

  const paymentRows = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (mode === "latest") {
      const base = normalizeArray(latestRes);

      return base.filter((r) => {
        const fullName = `${r.first_name ?? ""} ${r.last_name ?? ""}`
          .toLowerCase()
          .trim();

        const matchSearch =
          !q ||
          fullName.includes(q) ||
          String(r?.receipt_number ?? r?.payment_id ?? "")
            .toLowerCase()
            .includes(q);

        const matchStudent =
          !selectedStudentId ||
          String(r.student_id) === String(selectedStudentId);

        const matchBatch =
          !selectedBatchId || String(r.batch_id) === String(selectedBatchId);

        const matchBranch =
          !branchId || String(r.institute_branch_id) === String(branchId);

        return matchSearch && matchStudent && matchBatch && matchBranch;
      });
    }

    const baseLate = normalizeArray(lateRes);

    const flattened = baseLate.flatMap((s) => {
      const studentId = s?.student_id;
      const studentName = s?.student_name ?? "—";

      const installments = Array.isArray(s?.late_installments)
        ? s.late_installments
        : [];

      return installments.map((inst) => ({
        student_id: studentId,
        installment_id: inst?.installment_id,
        student_name: studentName,
        due_date: inst?.due_date,
        amount: inst?.amount,
        status: inst?.status,
        batch_id: s?.batch_id,
        institute_branch_id: s?.institute_branch_id,
      }));
    });

    return flattened.filter((r) => {
      const fullName = String(r.student_name ?? "")
        .toLowerCase()
        .trim();

      const matchSearch =
        !q ||
        fullName.includes(q) ||
        String(r?.installment_id ?? "")
          .toLowerCase()
          .includes(q);

      const matchStudent =
        !selectedStudentId ||
        String(r.student_id) === String(selectedStudentId);

      const matchBatch =
        !selectedBatchId || String(r.batch_id) === String(selectedBatchId);

      const matchBranch =
        !branchId || String(r.institute_branch_id) === String(branchId);

      return matchSearch && matchStudent && matchBatch && matchBranch;
    });
  }, [
    mode,
    latestRes,
    lateRes,
    search,
    selectedStudentId,
    selectedBatchId,
    branchId,
  ]);

  /* ================= Installments Rows ================= */

  const installmentStudentName = (r) => {
    return (
      r?.student_name ||
      r?.student?.full_name ||
      `${r?.student?.first_name ?? ""} ${r?.student?.last_name ?? ""}`.trim() ||
      "—"
    );
  };

  const installmentRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = normalizeArray(installmentsRes);

    return base
      .map((r) => {
        const student = students.find(
          (s) => String(s.id) === String(r.student_id),
        );

        return {
          ...r,
          student_name:
            student?.full_name ||
            `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim() ||
            "—",
          batch_id: r?.batch_id ?? student?.batch_id,
          institute_branch_id:
            r?.institute_branch_id ?? student?.institute_branch_id,
        };
      })
      .filter((r) => {
        const studentName = String(r.student_name ?? "")
          .toLowerCase()
          .trim();

        const matchSearch =
          !q ||
          studentName.includes(q) ||
          String(r?.installment_number ?? "")
            .toLowerCase()
            .includes(q) ||
          String(r?.status ?? "")
            .toLowerCase()
            .includes(q);

        const matchStudent =
          !selectedStudentId ||
          String(r?.student_id) === String(selectedStudentId);

        const matchBatch =
          !selectedBatchId ||
          String(r?.batch_id ?? "") === String(selectedBatchId);

        const matchBranch =
          !branchId ||
          String(r?.institute_branch_id ?? "") === String(branchId);

        return matchSearch && matchStudent && matchBatch && matchBranch;
      });
  }, [
    installmentsRes,
    students,
    search,
    selectedStudentId,
    selectedBatchId,
    branchId,
  ]);

  const rows = viewType === "payments" ? paymentRows : installmentRows;
  const currentRowId =
    viewType === "payments" ? paymentRowId : installmentRowId;

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [viewType, mode, search, selectedStudentId, selectedBatchId, branchId]);

  /* ================= Pending Helpers ================= */

  const markPending = (paymentId, type) => {
    if (!paymentId) return;
    setPendingMap((p) => ({
      ...p,
      [String(paymentId)]: { type, at: Date.now() },
    }));
  };

  const clearPending = (paymentId) => {
    if (!paymentId) return;
    setPendingMap((p) => {
      const copy = { ...p };
      delete copy[String(paymentId)];
      return copy;
    });
  };

  /* ================= Payments Mutations ================= */

  const [addPayment, { isLoading: addingPayment }] = useAddPaymentMutation();
  const [updatePayment, { isLoading: updatingPayment }] =
    useUpdatePaymentMutation();
  const [deletePayment, { isLoading: deletingPayment }] =
    useDeletePaymentMutation();

  /* ================= Installments Mutations ================= */

  const [addInstallment, { isLoading: addingInstallment }] =
    useAddPaymentInstallmentMutation();

  const [updateInstallment, { isLoading: updatingInstallment }] =
    useUpdatePaymentInstallmentMutation();

  const [deleteInstallment, { isLoading: deletingInstallment }] =
    useDeletePaymentInstallmentMutation();

  /* ================= Active Payment ================= */

  const [activePaymentId, setActivePaymentId] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const { data: paymentDetailsRes } = useGetPaymentByIdQuery(activePaymentId, {
    skip: !activePaymentId,
  });

  const activePayment = useMemo(
    () => normalizeObject(paymentDetailsRes),
    [paymentDetailsRes],
  );

  /* ================= Active Installment ================= */

  const [activeInstallmentId, setActiveInstallmentId] = useState(null);

  const { data: installmentDetailsRes } = useGetPaymentInstallmentByIdQuery(
    activeInstallmentId,
    {
      skip: !activeInstallmentId,
    },
  );

  const activeInstallment = useMemo(
    () => normalizeObject(installmentDetailsRes),
    [installmentDetailsRes],
  );

  /* ================= Modals ================= */

  const [openAdd, setOpenAdd] = useState(false);

  const [openPaymentEdit, setOpenPaymentEdit] = useState(false);
  const [openInstallmentEdit, setOpenInstallmentEdit] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);

  const [openDeletePayment, setOpenDeletePayment] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const [openDeleteInstallment, setOpenDeleteInstallment] = useState(false);
  const [installmentToDelete, setInstallmentToDelete] = useState(null);

  /* ================= Payment Handlers ================= */

  const editFromDetails = (row) => {
    const id = row?.id ?? row?.payment_id;
    if (!id) {
      notify.error("لا يوجد معرف للدفعة للتعديل");
      return;
    }

    setActivePaymentId(id);
    setOpenDetails(false);
    setOpenPaymentEdit(true);
  };

  const handleViewDetails = (row) => {
    setActiveRow(row);
    setActiveStudentId(row.student_id);

    const id = row.payment_id ?? row.id;
    if (!id) {
      notify.error("لا يوجد معرف دفعة لعرض التفاصيل");
      return;
    }

    setActivePaymentId(id);
    setOpenDetails(true);
  };

  const handleEditPayment = (row) => {
    const id = row.payment_id ?? row.id;
    if (!id) {
      notify.error("لا يوجد معرف دفعة للتعديل");
      return;
    }
    setActivePaymentId(id);
    setOpenPaymentEdit(true);
  };

  const handleDeletePayment = (row) => {
    setPaymentToDelete(row);
    setOpenDeletePayment(true);
  };

  const confirmDeletePayment = async () => {
    try {
      const idToDelete = paymentToDelete?.payment_id ?? paymentToDelete?.id;
      if (!idToDelete) return notify.error("لا يوجد معرف للدفعة");

      const res = await deletePayment({
        id: idToDelete,
        reason: "طلب حذف",
      }).unwrap();

      notify.success(res?.message || "تمت العملية");

      const isPending =
        res?.data?.status === "pending" ||
        String(res?.message || "").includes("ينتظر موافقة") ||
        String(res?.message || "").includes("تم إرسال طلب");

      if (isPending) {
        markPending(idToDelete, "delete");
      } else {
        clearPending(idToDelete);
      }

      setOpenDeletePayment(false);
      setPaymentToDelete(null);
    } catch (e) {
      notify.error(e?.data?.message || "فشل حذف الدفعة");
    }
  };

  const deleteFromDetails = async (row) => {
    try {
      const id = row?.id ?? row?.payment_id;
      if (!id) return notify.error("لا يوجد معرف للدفعة");

      const res = await deletePayment({ id, reason: "طلب حذف" }).unwrap();
      notify.success(res?.message || "تمت العملية");

      const isPending =
        res?.data?.status === "pending" ||
        String(res?.message || "").includes("ينتظر موافقة") ||
        String(res?.message || "").includes("تم إرسال طلب");

      if (isPending) {
        markPending(id, "delete");
      } else {
        clearPending(id);
      }

      setOpenDetails(false);
      setActivePaymentId(null);
      setActiveRow(null);
    } catch (e) {
      notify.error(e?.data?.message || "فشل حذف الدفعة");
    }
  };

  /* ================= Installment Handlers ================= */

  const handleEditInstallment = (row) => {
    const id = row?.id ?? row?.installment_id;
    if (!id) {
      notify.error("لا يوجد معرف للقسط للتعديل");
      return;
    }

    setActiveInstallmentId(id);
    setOpenInstallmentEdit(true);
  };

  const handleDeleteInstallment = (row) => {
    setInstallmentToDelete(row);
    setOpenDeleteInstallment(true);
  };

  const confirmDeleteInstallment = async () => {
    try {
      const id = installmentToDelete?.id ?? installmentToDelete?.installment_id;
      if (!id) {
        notify.error("لا يوجد معرف للقسط");
        return;
      }

      const res = await deleteInstallment(id).unwrap();
      notify.success(res?.message || "تم حذف القسط");

      setOpenDeleteInstallment(false);
      setInstallmentToDelete(null);
    } catch (e) {
      notify.error(e?.data?.message || "فشل حذف القسط");
    }
  };

  /* ================= Print ================= */

  const handlePrint = () => {
    if (!selectedIds.length) {
      notify.error("يرجى تحديد عنصر واحد على الأقل");
      return;
    }

    const selectedRows = rows.filter((r) =>
      selectedIds.includes(currentRowId(r)),
    );

    let html = "";

    if (viewType === "payments") {
      html = `
    <html dir="rtl">
      <head>
        <style>
          body{font-family:Arial;padding:20px}
          table{width:100%;border-collapse:collapse;font-size:12px}
          th,td{border:1px solid #ccc;padding:6px;text-align:right}
          th{background:#fbeaf3}
        </style>
      </head>
      <body>
        <h3>${
          mode === "latest" ? "دفعات الطلاب" : "الطلاب المتأخرين في الدفع"
        }</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم الكامل</th>
              <th>رقم الإيصال</th>
              <th>المبلغ</th>
              <th>${mode === "latest" ? "تاريخ الدفع" : "تاريخ الاستحقاق"}</th>
            </tr>
          </thead>
          <tbody>
            ${selectedRows
              .map((r, i) => {
                const receiptNumber =
                  r.receipt_number ?? r.receipt_no ?? r.payment_id ?? "—";

                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${esc(paymentStudentFullName(r, mode))}</td>
                    <td>${esc(receiptNumber)}</td>
                    <td>${esc(paymentMoneyLabel(r))}</td>
                    <td>${esc(r.paid_date ?? r.due_date ?? "—")}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;
    } else {
      html = `
  <html dir="rtl">
    <head>
      <style>
        body{font-family:Arial;padding:20px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ccc;padding:6px;text-align:right}
        th{background:#fbeaf3}
      </style>
    </head>
    <body>
      <h3>الأقساط</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الطالب</th>
            <th>رقم القسط</th>
            <th>المبلغ</th>
            <th>تاريخ الاستحقاق</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${selectedRows
            .map(
              (r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${esc(installmentStudentName(r))}</td>
                  <td>${esc(r.installment_number ?? "—")}</td>
                  <td>${esc(installmentMoneyLabel(r))}</td>
                  <td>${esc(r.due_date ?? "—")}</td>
                  <td>${esc(installmentStatusLabel(r.status))}</td>
                </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </body>
  </html>
`;
    }

    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  /* ================= Excel ================= */

  const handleExcel = () => {
    if (!selectedIds.length) {
      notify.error("يرجى تحديد عنصر واحد على الأقل");
      return;
    }

    const selectedRows = rows.filter((r) =>
      selectedIds.includes(currentRowId(r)),
    );

    const data =
      viewType === "payments"
        ? selectedRows.map((r) => ({
            "الاسم الكامل": paymentStudentFullName(r, mode),
            "رقم الإيصال":
              r.receipt_number ?? r.receipt_no ?? r.payment_id ?? "—",
            المبلغ: paymentMoneyLabel(r),
            [mode === "latest" ? "تاريخ الدفع" : "تاريخ الاستحقاق"]:
              r.paid_date ?? r.due_date ?? "—",
          }))
        : selectedRows.map((r) => ({
            "اسم الطالب": installmentStudentName(r),
            "رقم القسط": r.installment_number ?? "—",
            المبلغ: installmentMoneyLabel(r),
            "تاريخ الاستحقاق": r.due_date ?? "—",
            الحالة: installmentStatusLabel(r.status),
          }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      viewType === "payments" ? "Payments" : "Installments",
    );

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf]),
      viewType === "payments" ? "payments.xlsx" : "installments.xlsx",
    );
    notify.success("تم تصدير الإكسل");
  };

  /* ================= Add ================= */

  // const submitAddPayment = async (payload) => {
  //   try {
  //     const res = await addPayment(payload).unwrap();
  //     notify.success(res?.message || "تمت إضافة الدفعة");
  //     return res?.data || res;
  //   } catch (error) {
  //     return NextResponse.json(
  //       {
  //         status: false,
  //         message: error?.message || "حدث خطأ أثناء إرسال الرسالة",
  //         error_name: error?.name || null,
  //         error_cause: error?.cause?.message || null,
  //         error_stack:
  //           process.env.NODE_ENV === "development" ? error?.stack : null,
  //       },
  //       { status: 500 },
  //     );
  //   }
  // };
  const submitAddPayment = async (payload) => {
    try {
      const res = await addPayment(payload).unwrap();
      notify.success(res?.message || "تمت إضافة الدفعة");
      return res?.data || res;
    } catch (err) {
      notify.error(err?.data?.message || "فشل إضافة الدفعة");
      throw err;
    }
  };

  const submitAddInstallment = async (payload) => {
    try {
      await addInstallment(payload).unwrap();
      notify.success("تمت إضافة القسط");
      setOpenAdd(false);
    } catch (err) {
      const msg =
        err?.data?.message ||
        err?.data?.error ||
        (typeof err?.data === "string" ? err.data : null) ||
        "فشل إضافة القسط";

      const details = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" - ")
        : null;

      notify.error(details ? `${msg}: ${details}` : msg);
    }
  };

  /* ================= Edit ================= */

  const submitEditPayment = async (payload) => {
    try {
      const res = await updatePayment({
        id: activePaymentId,
        ...payload,
      }).unwrap();

      notify.success(res?.message || "تم إرسال الطلب");

      const isPending =
        res?.data?.status === "pending" ||
        String(res?.message || "").includes("ينتظر موافقة") ||
        String(res?.message || "").includes("تم إرسال طلب");

      if (isPending) {
        markPending(activePaymentId, "edit");
      } else {
        clearPending(activePaymentId);
      }

      return res?.data || res;
    } catch (err) {
      notify.error(err?.data?.message || "فشل التحديث");
      throw err;
    }
  };

  const submitEditInstallment = async (payload) => {
    try {
      const res = await updateInstallment({
        id: activeInstallmentId,
        ...payload,
      }).unwrap();

      notify.success(res?.message || "تم تعديل القسط");
      setOpenInstallmentEdit(false);
    } catch (err) {
      notify.error(err?.data?.message || "فشل تعديل القسط");
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">
            {viewType === "payments" ? "الدفعات" : "الأقساط"}
          </h1>
          <Breadcrumb />
        </div>

        <div className="flex flex-col gap-4 items-start md:items-end">
          <div className="flex flex-wrap gap-4">
            <SearchableSelect
              label="اسم الطالب"
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              options={[
                { value: "", label: "كل الطلاب" },
                ...students.map((s) => ({
                  value: String(s.id),
                  label: s.full_name,
                })),
              ]}
              allowClear
            />

            <SearchableSelect
              label="الشعبة"
              value={selectedBatchId}
              onChange={setSelectedBatchId}
              options={[
                { value: "", label: "كل الشعب" },
                ...batches.map((b) => ({
                  value: String(b.id),
                  label: b.name,
                })),
              ]}
              allowClear
            />
          </div>

          <div className="flex gap-2">
            <PrintButton onClick={handlePrint} />
            <ExcelButton onClick={handleExcel} />
          </div>
        </div>
      </div>

      <ActionsRow
        showSelectAll
        viewLabel=""
        isAllSelected={isAllSelected}
        onToggleSelectAll={() =>
          setSelectedIds(isAllSelected ? [] : rows.map(currentRowId))
        }
        addLabel={viewType === "payments" ? "إضافة دفعة" : ""}
        onAdd={viewType === "payments" ? () => setOpenAdd(true) : ""}
        extraButtons={[
          {
            label: viewType === "payments" ? "عرض الأقساط" : "اعرض الدفعات",
            onClick: () =>
              setViewType((prev) =>
                prev === "payments" ? "installments" : "payments",
              ),
          },
          ...(viewType === "payments"
            ? [
                {
                  label:
                    mode === "latest"
                      ? "دفعات الطلاب المتأخرين"
                      : "دفعات الطلاب",
                  onClick: () => setMode(mode === "latest" ? "late" : "latest"),
                },
              ]
            : []),
        ]}
      />

      {loading ? (
        <PaymentsTableSkeleton />
      ) : viewType === "payments" ? (
        <PaymentsTable
          mode={mode}
          rows={paymentRows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onViewDetails={handleViewDetails}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
          onOpenStudentPaymentsFromLate={(row) => {
            notify.info(`دفعات الطالب: ${row?.student_name ?? "—"}`);
          }}
          pendingMap={pendingMap}
        />
      ) : (
        <PaymentInstallmentsTable
          rows={installmentRows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEditInstallment}
          onDelete={handleDeleteInstallment}
        />
      )}

      {/* تفاصيل دفعة */}
      <PaymentDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        studentId={activeStudentId}
        payment={activeRow}
        onDeletePayment={deleteFromDetails}
        onEditPayment={editFromDetails}
        pendingMap={pendingMap}
      />

      {/* إضافة دفعة */}
      <PaymentAddModal
        open={openAdd && viewType === "payments"}
        onClose={() => setOpenAdd(false)}
        onSubmit={submitAddPayment}
        students={students}
        loading={addingPayment}
      />

      {/* تعديل دفعة */}
      <PaymentAddModal
        open={openPaymentEdit}
        title="تعديل دفعة"
        onClose={() => setOpenPaymentEdit(false)}
        onSubmit={submitEditPayment}
        students={students}
        initialData={activePayment}
        showReason
        loading={updatingPayment}
      />

      {/* إضافة قسط */}
      {/* <PaymentInstallmentAddModal
        open={openAdd && viewType === "installments"}
        onClose={() => setOpenAdd(false)}
        onSubmit={submitAddInstallment}
        loading={addingInstallment}
      /> */}

      {/* تعديل قسط */}
      {/* <PaymentInstallmentAddModal
        open={openInstallmentEdit}
        title="تعديل قسط"
        onClose={() => setOpenInstallmentEdit(false)}
        onSubmit={submitEditInstallment}
        initialData={activeInstallment}
        loading={updatingInstallment}
      /> */}

      {/* حذف دفعة */}
      <DeleteConfirmModal
        isOpen={openDeletePayment}
        loading={deletingPayment}
        title="حذف دفعة"
        description="هل أنت متأكد من الحذف؟"
        onClose={() => setOpenDeletePayment(false)}
        onConfirm={confirmDeletePayment}
      />

      {/* حذف قسط */}
      {/* <DeleteConfirmModal
        isOpen={openDeleteInstallment}
        loading={deletingInstallment}
        title="حذف قسط"
        description="هل أنت متأكد من حذف القسط؟"
        onClose={() => setOpenDeleteInstallment(false)}
        onConfirm={confirmDeleteInstallment}
      /> */}
    </div>
  );
}
