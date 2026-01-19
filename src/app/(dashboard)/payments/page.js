"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

/* ================= helpers ================= */
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
      `${r?.student_id ?? "s"}-${r?.paid_date ?? r?.due_date ?? "d"}`
  );

const moneyLabel = (r) => {
  if (r?.amount_usd) return `${r.amount_usd}$`;
  if (r?.amount_syp) return `${r.amount_syp} ل.س`;
  return "—";
};

/* ================= component ================= */
export default function PaymentsPage() {
  /* ================= mode ================= */
  const [mode, setMode] = useState("latest"); // latest | late

  /* ================= global filters (navbar) ================= */
  const search = useSelector((s) => s.search.values.payments || "");
  const branchId = useSelector((s) => s.search.values.branch || "");

  /* ================= local filters ================= */
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  /* ================= options ================= */
  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const students = useMemo(() => normalizeArray(studentsRes), [studentsRes]);

  const { data: batchesRes } = useGetBatchesQuery();

  /* ================= API (مرة واحدة فقط) ================= */
  const { data: latestRes, isLoading: loadingLatest } =
    useGetLatestPaymentsPerStudentQuery();

  const { data: lateRes, isLoading: loadingLate } =
    useGetStudentLatePaymentsQuery();

  const loading = mode === "latest" ? loadingLatest : loadingLate;

  /* ================= rows (LOCAL FILTERING) ================= */
  const rows = useMemo(() => {
    const base =
      mode === "latest" ? normalizeArray(latestRes) : normalizeArray(lateRes);

    const q = search.toLowerCase().trim();

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
  }, [
    mode,
    latestRes,
    lateRes,
    search,
    selectedStudentId,
    selectedBatchId,
    branchId,
  ]);

  /* ================= selection ================= */
  const [selectedIds, setSelectedIds] = useState([]);
  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [mode, search, selectedStudentId, selectedBatchId, branchId]);

  /* ================= CRUD ================= */
  const [addPayment, { isLoading: adding }] = useAddPaymentMutation();
  const [updatePayment, { isLoading: updating }] = useUpdatePaymentMutation();
  const [deletePayment, { isLoading: deleting }] = useDeletePaymentMutation();

  /* ================= details ================= */
  const [activePaymentId, setActivePaymentId] = useState(null);

  // ✅ للـ details modal (ملخص الطالب) — لازم نخزن الطالب اللي ضغطنا عليه
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  // (اختياري) إذا بتحتاج تفاصيل دفعة واحدة للتعديل أو لشي ثاني
  const { data: paymentDetailsRes } = useGetPaymentByIdQuery(activePaymentId, {
    skip: !activePaymentId,
  });

  const activePayment = useMemo(
    () => normalizeObject(paymentDetailsRes),
    [paymentDetailsRes]
  );

  /* ================= modals ================= */
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);

  /* ================= actions ================= */
  const handleViewDetails = (row) => {
    setActiveRow(row);
    setActiveStudentId(row.student_id); // ✅ أهم سطر
    setActivePaymentId(row.payment_id ?? row.id);
    setOpenDetails(true);
  };

  const handleEdit = (row) => {
    setActivePaymentId(row.payment_id ?? row.id);
    setOpenEdit(true);
  };

  const handleDelete = (row) => {
    setPaymentToDelete(row);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      // انتبه: عندك بالجدول payment_id — بس بالـ delete عم تستخدم id
      const idToDelete = paymentToDelete?.payment_id ?? paymentToDelete?.id;

      await deletePayment(idToDelete).unwrap();
      toast.success("تم حذف الدفعة بنجاح");
      setOpenDelete(false);
      setPaymentToDelete(null);
    } catch {
      toast.error("فشل حذف الدفعة");
    }
  };

  /* ================= Print ================= */
  const handlePrint = () => {
    if (!selectedIds.length)
      return toast.error("يرجى تحديد عنصر واحد على الأقل");

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
                    <td>${esc(r.first_name)}</td>
                    <td>${esc(r.last_name)}</td>
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

  /* ================= Excel ================= */
  const handleExcel = () => {
    if (!selectedIds.length)
      return toast.error("يرجى تحديد عنصر واحد على الأقل");

    const data = rows
      .filter((r) => selectedIds.includes(rowId(r)))
      .map((r) => ({
        الاسم: r.first_name,
        الكنية: r.last_name,
        المبلغ: moneyLabel(r),
        التاريخ: r.paid_date ?? r.due_date,
      }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "payments.xlsx");
  };

  /* ================= submit ================= */
  const submitAdd = async (payload) => {
    try {
      await addPayment(payload).unwrap();
      toast.success("تمت إضافة الدفعة");
      setOpenAdd(false);
    } catch (err) {
      console.log("ADD PAYMENT ERROR:", err);

      const msg =
        err?.data?.message ||
        err?.data?.error ||
        (typeof err?.data === "string" ? err.data : null) ||
        "فشل الإضافة";

      // لو في errors مفصلة (validation)
      const details = err?.data?.errors
        ? Object.values(err.data.errors).flat().join(" - ")
        : null;

      toast.error(details ? `${msg}: ${details}` : msg);
    }
  };

  const submitEdit = async (payload) => {
    try {
      await updatePayment({
        id: activePaymentId,
        ...payload,
      }).unwrap();
      toast.success("تم التحديث");
      setOpenEdit(false);
    } catch {
      toast.error("فشل التحديث");
    }
  };

  /* ================= Render ================= */
  return (
    <div dir="rtl" className="p-6 space-y-6">
      {/* ================= TITLE + BREADCRUMB ================= */}
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">الدفعات</h1>
          <Breadcrumb />
        </div>

        {/* ================= FILTERS ================= */}
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
            />
          </div>

          <div className="flex gap-2">
            <PrintButton onClick={handlePrint} />
            <ExcelButton onClick={handleExcel} />
          </div>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
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

      {/* ================= TABLE ================= */}
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
        />
      )}

      {/* ================= MODALS ================= */}
      <PaymentDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        studentId={activeStudentId} // ✅ صح
        payment={activeRow} // ✅ صف الجدول
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
