"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  useGetFamiliesQuery,
  useDeleteFamilyMutation,
} from "@/store/services/familiesApi";

import FamiliesTable from "./components/FamiliesTable";
import AddFamilyModal from "./components/AddFamilyModal";
import FamilyDetailsModal from "./components/FamilyDetailsModal";
import ActivateFamilyModal from "./components/ActivateFamilyModal";
import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function FamiliesPage() {
  const { data, isLoading } = useGetFamiliesQuery();
  const families = data?.data || [];
  const [deleteFamily, { isLoading: isDeleting }] = useDeleteFamilyMutation();
  const search = useSelector((state) => state.search?.values?.families || "");

  const filteredFamilies = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return families;

    return families.filter((f) => {
      const id = String(f.id).toLowerCase();
      const userName = (f.user?.name ?? "").toLowerCase();
      return id.includes(q) || userName.includes(q);
    });
  }, [families, search]);

  const [selectedIds, setSelectedIds] = useState([]);
  const isAllSelected =
    filteredFamilies.length > 0 && selectedIds.length === filteredFamilies.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredFamilies.map((r) => String(r.id)));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredFamilies.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredFamilies]);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [detailsFamilyId, setDetailsFamilyId] = useState(null);

  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [familyToActivate, setFamilyToActivate] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);

  // Actions
  const handleEdit = (row) => {
    setSelectedFamily(row);
    setIsAddOpen(true);
  };

  const handleView = (row) => {
    setDetailsFamilyId(row.id);
    setIsDetailsOpen(true);
  };

  const handleActivate = (row) => {
    setFamilyToActivate(row);
    setIsActivateOpen(true);
  };

  const handleDelete = (row) => {
    setFamilyToDelete(row);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!familyToDelete) return;
    try {
      await deleteFamily(familyToDelete.id).unwrap();
      toast.success("تم حذف العائلة بنجاح");
      setIsDeleteOpen(false);
      setFamilyToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      toast.error(
        err?.data?.message || "حدث خطأ أثناء الحذف (يجب ألا تكون مرتبطة بطلاب)",
      );
    }
  };

  if (isLoading) {
    return (
      <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col text-right">
            <h1 className="text-lg font-semibold text-gray-700">
              العائلات وأولياء الأمور
            </h1>
            <Breadcrumb />
          </div>
        </div>
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">
            العائلات وأولياء الأمور
          </h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3">
        <ActionsRow
          addLabel="إضافة عائلة"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedFamily(null);
            setIsAddOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintExportActions 
            data={filteredFamilies}
            selectedIds={selectedIds}
            columns={[
              { header: "رقم العائلة", key: "id" },
              { 
                header: "اسم المستخدم", 
                key: "user",
                render: (val) => val?.name || "-"
              },
              { 
                header: "البريد الإلكتروني", 
                key: "user",
                render: (val) => val?.email || "-"
              },
              { 
                header: "عدد الطلاب", 
                key: "students_count",
              },
              { 
                header: "الحالة", 
                key: "is_active",
                render: (val) => (val ? "نشط" : "غير نشط")
              },
            ]}
            title="قائمة العائلات"
            filename="العائلات"
          />
        </div>
      </div>

      <FamiliesTable
        families={filteredFamilies}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onView={handleView}
        onEdit={handleEdit}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />

      <AddFamilyModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        family={selectedFamily}
      />

      <FamilyDetailsModal
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        familyId={detailsFamilyId}
      />

      <ActivateFamilyModal
        isOpen={isActivateOpen}
        onClose={() => setIsActivateOpen(false)}
        family={familyToActivate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف عائلة"
        description={`هل أنت متأكد من حذف العائلة #${familyToDelete?.id}؟ لا يمكن التراجع عن هذا الإجراء.`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
