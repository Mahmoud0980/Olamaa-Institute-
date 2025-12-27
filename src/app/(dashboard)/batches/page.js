"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ===== APIs =====
import {
  useGetBatchesQuery,
  useDeleteBatchMutation,
} from "@/store/services/batchesApi";

// ===== Components =====
import BatchesTable from "./components/BatchesTable";
import AddBatchModal from "./components/AddBatchModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function BatchesPage() {
  // ===== Redux Filters =====
  const search = useSelector((state) => state.search.values.batches);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data, isLoading } = useGetBatchesQuery();
  const batches = data?.data || [];

  const [deleteBatch, { isLoading: isDeleting }] = useDeleteBatchMutation();

  // ===== Helpers =====
  const getGenderLabel = (g) =>
    g === "male" ? "ذكور" : g === "female" ? "إناث" : "-";

  const getStatusLabel = (b) =>
    b.is_completed
      ? "مكتملة"
      : b.is_hidden
      ? "مخفية"
      : b.is_archived
      ? "مؤرشفة"
      : "نشطة";

  // ===== Filtering =====
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch = b.name
        .toLowerCase()
        .includes((search || "").toLowerCase());

      const matchBranch =
        !branchId || Number(branchId) === b.institute_branch?.id;

      return matchSearch && matchBranch;
    });
  }, [batches, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filteredBatches.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredBatches.map((b) => b.id));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedBatch(filteredBatches.find((b) => b.id === id) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (batch) => {
    setBatchToDelete(batch);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;

    try {
      await deleteBatch(batchToDelete.id).unwrap();
      toast.success("تم حذف الشعبة بنجاح");
      setIsDeleteOpen(false);
      setBatchToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "فشل حذف الشعبة");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (!selectedIds.length)
      return toast.error("يرجى تحديد شعبة واحدة على الأقل");

    const rows = batches.filter((b) => selectedIds.includes(b.id));

    const html = `
    <html dir="rtl">
      <head>
        <style>
          body { font-family: Arial; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            border: 1px solid #ccc;
            padding: 6px;
            font-size: 12px;
          }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h3>قائمة الشعب</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الشعبة</th>
              <th>الجنس</th>
              <th>الفرع</th>
              <th>الفرع الأكاديمي</th>
              <th>القاعة</th>
              
              <th>البداية</th>
              <th>النهاية</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (b, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${b.name}</td>
                <td>${getGenderLabel(b.gender_type)}</td>
                <td>${b.institute_branch?.name || "-"}</td>
                <td>${b.academic_branch?.name || "-"}</td>
                <td>${b.class_room?.name || "-"}</td>
                <td>${b.start_date}</td>
                <td>${b.end_date}</td>
                <td>${getStatusLabel(b)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
    `;

    const win = window.open("", "", "width=1200,height=800");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel =====
  const handleExcel = () => {
    if (!selectedIds.length)
      return toast.error("يرجى تحديد شعبة واحدة على الأقل");

    const rows = batches.filter((b) => selectedIds.includes(b.id));

    const excelRows = rows.map((b) => ({
      "اسم الشعبة": b.name,
      الجنس: getGenderLabel(b.gender_type),
      الفرع: b.institute_branch?.name || "-",
      "الفرع الأكاديمي": b.academic_branch?.name || "-",
      القاعة: b.class_room?.name || "-",
      "تاريخ البداية": b.start_date,
      "تاريخ النهاية": b.end_date,
      الحالة: getStatusLabel(b),
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Batches");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "قائمة_الشعب.xlsx"
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-700">
            الجداول الرئيسية
          </h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة شعبة"
          showSelectAll
          viewLabel=""
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedBatch(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      <BatchesTable
        batches={filteredBatches}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        batch={selectedBatch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف شعبة"
        description={`هل أنت متأكد من حذف الشعبة ${batchToDelete?.name}؟`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
