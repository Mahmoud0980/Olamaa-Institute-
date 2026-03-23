"use client";

import { useState, useMemo, useEffect } from "react";
import { notify } from "@/lib/helpers/toastify";
import { useSelector } from "react-redux";
import {
  useGetInstituteBranchesQuery,
  useDeleteInstituteBranchMutation,
} from "@/store/services/instituteBranchesApi";

import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

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
        .includes((search || "").toLowerCase()),
    );
  }, [branches, search]);

  const isAllSelected =
    filteredBranches.length > 0 &&
    selectedIds.length === filteredBranches.length;

  const toggleSelectAll = () => {
    setSelectedIds(
      isAllSelected ? [] : filteredBranches.map((b) => String(b.id)),
    );
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredBranches.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredBranches]);

  // ===== Delete =====
  const [openDelete, setOpenDelete] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = [
      "#",
      "اسم الفرع",
      "الكود",
      "الهاتف",
      "البريد",
      "المدير",
      "العنوان",
      "الحالة",
      "خيارات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  const handleDelete = (b) => {
    setBranchToDelete(b);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBranch(branchToDelete.id).unwrap();
      notify.success("تم حذف الفرع بنجاح");
      setSelectedIds([]);
      setOpenDelete(false);
    } catch {
      notify.error("فشل الحذف");
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
          <PrintExportActions
            data={filteredBranches}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم الفرع", key: "name" },
              { header: "الكود", key: "code" },
              { header: "الهاتف", key: "phone" },
              { header: "البريد", key: "email" },
              { header: "المدير", key: "manager_name" },
              { header: "العنوان", key: "address" },
              {
                header: "الحالة",
                key: "is_active",
                render: (val) => (val ? "نشط" : "غير نشط"),
              },
            ]}
            title="قائمة الفروع"
            filename="الفروع"
          />
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
