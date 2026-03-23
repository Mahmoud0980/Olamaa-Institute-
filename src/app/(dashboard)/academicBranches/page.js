"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
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
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

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
    setSelectedIds(
      isAllSelected ? [] : filteredBranches.map((r) => String(r.id)),
    );
  };

  // تفريغ التحديد عند تغيير البحث/الفرع
  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredBranches.some((r) => String(r.id) === String(id)),
      );

      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredBranches]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = ["#", "اسم الفرع الأكاديمي", "الوصف", "الإجراءات"];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedBranch(
      filteredBranches.find((r) => String(r.id) === String(id)) || null,
    );
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
      notify.success("تم حذف الفرع الأكاديمي بنجاح");
      setIsDeleteOpen(false);
      setBranchToDelete(null);
      setSelectedIds((prev) =>
        prev.filter((id) => id !== String(branchToDelete.id)),
      );
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
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
          <PrintExportActions
            data={filteredBranches}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم الفرع الأكاديمي", key: "name" },
              // {
              //   header: "الفرع المعهد",
              //   key: "institute_branch_id",
              //   render: (id) => getInstituteBranchName(id),
              // },
              { header: "الوصف", key: "description" },
            ]}
            title="قائمة الفروع الأكاديمية"
            filename="الفروع_الأكاديمية"
          />
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
        branches={academicBranches}
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
