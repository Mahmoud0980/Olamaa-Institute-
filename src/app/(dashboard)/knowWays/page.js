"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  useGetKnowWaysQuery,
  useDeleteKnowWayMutation,
} from "@/store/services/knowWaysApi";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";

import KnowWaysTable from "./components/KnowWaysTable";
import AddKnowWayModal from "./components/AddKnowWayModal";

export default function KnowWaysPage() {
  // ===== Navbar filter =====
  const branchId = useSelector((state) => state.search.values.branch);
  const search = useSelector((state) => state.search.values.knowWays);
  console.log("SEARCH:", search);

  // ===== Data =====
  const { data, isLoading } = useGetKnowWaysQuery();
  const knowWays = data?.data || [];

  const [deleteKnowWay, { isLoading: deleting }] = useDeleteKnowWayMutation();

  // ===== Filter =====
  const filtered = useMemo(() => {
    return knowWays.filter((item) =>
      item.name?.toLowerCase().includes((search || "").toLowerCase()),
    );
  }, [knowWays, search]);
  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filtered.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filtered.map((i) => i.id));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [branchId]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteKnowWay(itemToDelete.id).unwrap();
      notify.success("تم الحذف بنجاح");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل الحذف");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد عنصر واحد على الأقل للطباعة");
      return;
    }

    const rows = filtered.filter((i) => selectedIds.includes(i.id));

    const html = `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial; }
            table { width:100%; border-collapse: collapse; }
            th, td { border:1px solid #ccc; padding:6px; font-size:12px }
            th { background:#f3f3f3 }
          </style>
        </head>
        <body>
          <h3>طرق المعرفة</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>طريقة المعرفة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${r.name}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد عنصر واحد على الأقل للتصدير");
      return;
    }

    const rows = filtered.filter((i) => selectedIds.includes(i.id));

    const excelRows = rows.map((r) => ({
      "طريقة المعرفة": r.name,
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "KnowWays");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "طرق_المعرفة.xlsx",
    );
  };

  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      <Breadcrumb />

      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة طريقة"
          showSelectAll
          viewLabel=""
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      <KnowWaysTable
        data={filtered}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AddKnowWayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editItem}
        allNames={knowWays.map((k) => k.name)}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={deleting}
        title="حذف طريقة معرفة"
        description={`هل أنت متأكد من حذف ${itemToDelete?.name}؟`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
