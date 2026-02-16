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
  if (typeof res === "object") return res;
  return null;
}

const rowId = (r) =>
  String(
    r?.payment_id ??
      r?.id ??
      r?.installment_id ?? // ✅ للـ late mode
      `${r?.student_id ?? "s"}-${r?.paid_date ?? r?.due_date ?? "d"}`
  );

// رح يجيب تفاصيل الدفعة للتعديل عبر useGetPaymentByIdQuery

const moneyLabel = (r) => {
  // ✅ late mode amount
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

export default function PaymentsPage() {
  const [mode, setMode] = useState("latest");
  const [pendingMap, setPendingMap] = useState({});
  const search = useSelector((s) => s.search.values.payments || "");
  const branchId = useSelector((s) => s.search.values.branch || "");

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const students = useMemo(() => normalizeArray(studentsRes), [studentsRes]);

  const { data: batchesRes } = useGetBatchesQuery();

  const { data: latestRes, isLoading: loadingLatest } =
    useGetLatestPaymentsPerStudentQuery();

  const { data: lateRes, isLoading: loadingLate } =
    useGetStudentLatePaymentsQuery();

  const loading = mode === "latest" ? loadingLatest : loadingLate;

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();

    // ===== latest mode =====
    if (mode === "latest") {
      const base = normalizeArray(latestRes);

      return base.filter((r) => {
        const fullName = `${r.first_name ?? ""} ${r.last_name ?? ""}`
          .toLowerCase()
          .trim();

        const matchSearch = !q || fullName.includes(q);
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

    // ===== late mode (API: student_name + late_installments[]) =====
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

        // optional for filters if exist in response
        batch_id: s?.batch_id,
        institute_branch_id: s?.institute_branch_id,
      }));
    });

    return flattened.filter((r) => {
      const fullName = String(r.student_name ?? "")
        .toLowerCase()
        .trim();

      const matchSearch = !q || fullName.includes(q);
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

  const [selectedIds, setSelectedIds] = useState([]);
  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
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
  useEffect(() => {
    setSelectedIds([]);
  }, [mode, search, selectedStudentId, selectedBatchId, branchId]);

  const [addPayment, { isLoading: adding }] = useAddPaymentMutation();
  const [updatePayment, { isLoading: updating }] = useUpdatePaymentMutation();
  const [deletePayment, { isLoading: deleting }] = useDeletePaymentMutation();

  const [activePaymentId, setActivePaymentId] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  const { data: paymentDetailsRes } = useGetPaymentByIdQuery(activePaymentId, {
    skip: !activePaymentId,
  });

  const activePayment = useMemo(
    () => normalizeObject(paymentDetailsRes),
    [paymentDetailsRes]
  );

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const editFromDetails = (row) => {
    const id = row?.id ?? row?.payment_id;
    if (!id) {
      notify.error("لا يوجد معرف للدفعة للتعديل");
      return;
    }

    setActivePaymentId(id); // ✅ هيك صح
    setOpenDetails(false); // ✅ سكّر التفاصيل
    setOpenEdit(true); // ✅ افتح مودال التعديل
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  const handleViewDetails = (row) => {
    setActiveRow(row);
    setActiveStudentId(row.student_id);

    // ✅ في late mode ما في payment_id عادة
    const id = row.payment_id ?? row.id;
    if (!id) {
      notify.error("لا يوجد معرف دفعة لعرض التفاصيل");
      return;
    }

    setActivePaymentId(id);
    setOpenDetails(true);
  };

  const handleEdit = (row) => {
    const id = row.payment_id ?? row.id;
    if (!id) {
      notify.error("لا يوجد معرف دفعة للتعديل");
      return;
    }
    setActivePaymentId(id);
    setOpenEdit(true);
  };

  const handleDelete = (row) => {
    setPaymentToDelete(row);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
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

      setOpenDelete(false);
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
        markPending(id, "delete"); // ✅ يبين معلّق بالجدول
        // ✅ خليه يضل فاتح تفاصيل الطالب إذا بدك، بس أنت سكرتو.. تمام
      } else {
        clearPending(id); // ✅ admin حذف فعلي
      }

      setOpenDetails(false);
      setActivePaymentId(null);
      setActiveRow(null);
    } catch (e) {
      notify.error(e?.data?.message || "فشل حذف الدفعة");
    }
  };

  const handlePrint = () => {
    if (!selectedIds.length) {
      notify.error("يرجى تحديد عنصر واحد على الأقل");
      return;
    }

    const selectedRows = rows.filter((r) => selectedIds.includes(rowId(r)));

    const html = `
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
                <th>الاسم</th>
                <th>الكنية</th>
                <th>المبلغ</th>
                <th>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${selectedRows
                .map(
                  (r, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${esc(
                      mode === "late" ? r.student_name : r.first_name
                    )}</td>
                    <td>${esc(mode === "late" ? "—" : r.last_name)}</td>
                    <td>${esc(moneyLabel(r))}</td>
                    <td>${esc(r.paid_date ?? r.due_date ?? "—")}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const w = window.open("", "", "width=900,height=700");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const handleExcel = () => {
    if (!selectedIds.length) {
      notify.error("يرجى تحديد عنصر واحد على الأقل");
      return;
    }

    const data = rows
      .filter((r) => selectedIds.includes(rowId(r)))
      .map((r) => ({
        الاسم: mode === "late" ? r.student_name : r.first_name,
        الكنية: mode === "late" ? "—" : r.last_name,
        المبلغ: moneyLabel(r),
        التاريخ: r.paid_date ?? r.due_date,
      }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "payments.xlsx");
    notify.success("تم تصدير الإكسل");
  };

  const submitAdd = async (payload) => {
    try {
      await addPayment(payload).unwrap();
      notify.success("تمت إضافة الدفعة");
      setOpenAdd(false);
    } catch (err) {
      console.log("ADD PAYMENT ERROR:", err);

      const msg =
        err?.data?.message ||
        err?.data?.error ||
        (typeof err?.data === "string" ? err.data : null) ||
        "فشل الإضافة";

      const details = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" - ")
        : null;

      notify.error(details ? `${msg}: ${details}` : msg);
    }
  };

  const submitEdit = async (payload) => {
    try {
      const res = await updatePayment({
        id: activePaymentId,
        ...payload,
      }).unwrap();

      notify.success(res?.message || "تم إرسال الطلب");

      // ✅ إذا مو admin بيرجع pending (حسب كلامك)
      const isPending =
        res?.data?.status === "pending" ||
        String(res?.message || "").includes("ينتظر موافقة");

      if (isPending) {
        markPending(activePaymentId, "edit");
      } else {
        // admin: تعديل فوري -> شيل أي pending قديم
        clearPending(activePaymentId);
      }

      setOpenEdit(false);
    } catch (err) {
      notify.error(err?.data?.message || "فشل التحديث");
    }
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">الدفعات</h1>
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
                ...(batchesRes?.data || []).map((b) => ({
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
          setSelectedIds(isAllSelected ? [] : rows.map(rowId))
        }
        addLabel="إضافة دفعة"
        onAdd={() => setOpenAdd(true)}
        extraButtons={[
          {
            label:
              mode === "latest" ? "دفعات الطلاب المتأخرين" : "دفعات الطلاب",
            onClick: () => setMode(mode === "latest" ? "late" : "latest"),
          },
        ]}
      />

      {loading ? (
        <PaymentsTableSkeleton />
      ) : (
        <PaymentsTable
          mode={mode}
          rows={rows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onOpenStudentPaymentsFromLate={(row) => {
            notify.info(`دفعات الطالب: ${row?.student_name ?? "—"}`);
          }}
          pendingMap={pendingMap}
        />
      )}

      <PaymentDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        studentId={activeStudentId}
        payment={activeRow}
        onDeletePayment={deleteFromDetails}
        onEditPayment={editFromDetails}
        pendingMap={pendingMap}
      />

      <PaymentAddModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={submitAdd}
        students={students}
        loading={adding}
      />

      <PaymentAddModal
        open={openEdit}
        title="تعديل دفعة"
        onClose={() => setOpenEdit(false)}
        onSubmit={submitEdit}
        students={students}
        initialData={activePayment}
        showReason
        loading={updating}
      />

      <DeleteConfirmModal
        isOpen={openDelete}
        loading={deleting}
        title="حذف دفعة"
        description="هل أنت متأكد من الحذف؟"
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
