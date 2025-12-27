"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  useGetAcademicBranchesQuery,
  useDeleteAcademicBranchMutation,
} from "@/store/services/academicBranchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

import AcademicBranchesTable from "./components/AcademicBranchesTable";
import AddAcademicBranchModal from "./components/AddAcademicBranchModal";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function AcademicBranchesPage() {
  // ===== بحث + فلترة من Navbar =====
  const search = useSelector((state) => state.search.values.academicBranches);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data, isLoading } = useGetAcademicBranchesQuery();
  const academicBranches = data?.data || [];

  const [deleteAcademicBranch, { isLoading: isDeleting }] =
    useDeleteAcademicBranchMutation();

  const { data: instData } = useGetInstituteBranchesQuery();
  const instituteBranches = instData?.data || [];

  const getInstituteBranchName = (id) =>
    instituteBranches.find((b) => Number(b.id) === Number(id))?.name || "-";

  // ===== Filtering =====
  const filteredBranches = useMemo(() => {
    return academicBranches.filter((row) => {
      const matchSearch = (row?.name ?? "")
        .toLowerCase()
        .includes((search || "").toLowerCase());

      const itemBranchId = row?.institute_branch_id ?? row?.branch_id ?? null;

      // إذا ما في branch id بالـ rows أساساً: ما منطبق فلترة الفرع (حتى ما تصير الصفحة فاضية)
      const matchBranch =
        !branchId || itemBranchId == null
          ? true
          : Number(branchId) === Number(itemBranchId);

      return matchSearch && matchBranch;
    });
  }, [academicBranches, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filteredBranches.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredBranches.map((r) => r.id));
  };

  // تفريغ التحديد عند تغيير البحث/الفرع
  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) =>
      prev.filter((id) => filteredBranches.some((r) => r.id === id))
    );
  }, [filteredBranches]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedBranch(filteredBranches.find((r) => r.id === id) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setBranchToDelete(row);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!branchToDelete) return;

    try {
      await deleteAcademicBranch(branchToDelete.id).unwrap();
      toast.success("تم حذف الفرع الأكاديمي بنجاح");
      setIsDeleteOpen(false);
      setBranchToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  // ===== Print (شرط: لازم تحديد) =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد فرع أكاديمي واحد على الأقل للطباعة");
      return;
    }

    const rows = filteredBranches.filter((r) => selectedIds.includes(r.id));
    if (!rows.length) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }

    const showBranchCol = rows.some(
      (r) => r?.institute_branch_id != null || r?.branch_id != null
    );

    const html = `
      <html dir="rtl">
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial; padding: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td {
              border: 1px solid #ccc;
              padding: 6px;
              font-size: 12px;
              text-align: right;
              vertical-align: top;
            }
            th { background: #f3f3f3; }
            h3 { margin: 0 0 12px; }
          </style>
        </head>
        <body>
          <h3>قائمة الفروع الأكاديمية</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>اسم الفرع الأكاديمي</th>
                ${showBranchCol ? "<th>الفرع</th>" : ""}
                <th>الوصف</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map((r, i) => {
                  const instId = r?.institute_branch_id ?? r?.branch_id;
                  return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${r?.name ?? "-"}</td>
                      ${
                        showBranchCol
                          ? `<td>${getInstituteBranchName(instId)}</td>`
                          : ""
                      }
                      <td>${r?.description ?? "-"}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=1200,height=800");
    if (!win) {
      toast.error("المتصفح منع نافذة الطباعة");
      return;
    }

    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel (شرط: لازم تحديد) =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد فرع أكاديمي واحد على الأقل للتصدير");
      return;
    }

    const rows = filteredBranches.filter((r) => selectedIds.includes(r.id));
    if (!rows.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const excelRows = rows.map((r) => ({
      "اسم الفرع الأكاديمي": r?.name ?? "-",
      // الفرع: getInstituteBranchName(r?.institute_branch_id ?? r?.branch_id),
      الوصف: r?.description ?? "-",
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AcademicBranches");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "قائمة_الفروع_الأكاديمية.xlsx"
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">
            الجداول الرئيسية
          </h1>
          <Breadcrumb />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <ActionsRow
          addLabel="إضافة فرع أكاديمي"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedBranch(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* TABLE (عرض فوراً) */}
      <AcademicBranchesTable
        branches={filteredBranches}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddAcademicBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={selectedBranch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف فرع أكاديمي"
        description={`هل أنت متأكد من حذف الفرع الأكاديمي ${
          branchToDelete?.name || ""
        }؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setBranchToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
