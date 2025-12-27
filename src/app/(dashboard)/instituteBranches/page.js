"use client";

import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useSelector } from "react-redux";
import {
  useGetInstituteBranchesQuery,
  useDeleteInstituteBranchMutation,
} from "@/store/services/instituteBranchesApi";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";

import InstituteBranchesTable from "./components/InstituteBranchesTable";
import AddInstituteBranchModal from "./components/AddInstituteBranchModal";

export default function InstituteBranchesPage() {
  const { data, isLoading } = useGetInstituteBranchesQuery();
  const branches = data?.data || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const search = useSelector((state) => state.search.values.instituteBranches);
  const [deleteBranch, { isLoading: deleting }] =
    useDeleteInstituteBranchMutation();
  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);
  const filteredBranches = useMemo(() => {
    return branches.filter((b) =>
      [b.name, b.code, b.phone]
        .join(" ")
        .toLowerCase()
        .includes((search || "").toLowerCase())
    );
  }, [branches, search]);
  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filteredBranches.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredBranches.map((b) => b.id));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // ===== Delete =====
  const [openDelete, setOpenDelete] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const handleDelete = (b) => {
    setBranchToDelete(b);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBranch(branchToDelete.id).unwrap();
      toast.success("تم حذف الفرع بنجاح");
      setSelectedIds([]);
      setOpenDelete(false);
    } catch {
      toast.error("فشل الحذف");
    }
  };
  const handleAdd = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد فرع واحد على الأقل للطباعة");
      return;
    }

    const rows = filteredBranches.filter((b) => selectedIds.includes(b.id));

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
            text-align: right;
          }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h3>قائمة الفروع</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم الفرع</th>
              <th>الكود</th>
              <th>الهاتف</th>
              <th>البريد</th>
              <th>المدير</th>
              <th>العنوان</th>
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
                <td>${b.code || "-"}</td>
                <td>${b.phone || "-"}</td>
                <td>${b.email || "-"}</td>
                <td>${b.manager_name || "-"}</td>
                <td>${b.address || "-"}</td>
                <td>${b.is_active ? "نشط" : "غير نشط"}</td>
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
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد فرع واحد على الأقل للتصدير");
      return;
    }

    const rows = filteredBranches.filter((b) => selectedIds.includes(b.id));

    const excelRows = rows.map((b) => ({
      "اسم الفرع": b.name,
      الكود: b.code || "",
      الهاتف: b.phone || "",
      البريد: b.email || "",
      المدير: b.manager_name || "",
      العنوان: b.address || "",
      الحالة: b.is_active ? "نشط" : "غير نشط",
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Institute Branches");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "قائمة_الفروع.xlsx"
    );
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold">قائمة الفروع</h1>
        <Breadcrumb />
      </div>

      <div className="flex justify-between">
        <ActionsRow
          showSelectAll
          viewLabel=""
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          addLabel="إضافة فرع"
          onAdd={handleAdd}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      <InstituteBranchesTable
        branches={filteredBranches}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DeleteConfirmModal
        isOpen={openDelete}
        loading={deleting}
        title="حذف فرع"
        description={`هل أنت متأكد من حذف ${branchToDelete?.name}؟`}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />
      <AddInstituteBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={selectedBranch}
      />
    </div>
  );
}
