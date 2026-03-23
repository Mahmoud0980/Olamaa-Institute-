"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";

import {
  useGetKnowWaysQuery,
  useDeleteKnowWayMutation,
} from "@/store/services/knowWaysApi";

import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

import KnowWaysTable from "./components/KnowWaysTable";
import AddKnowWayModal from "./components/AddKnowWayModal";

export default function KnowWaysPage() {
  // ===== Navbar filter =====
  const branchId = useSelector((state) => state.search.values.branch);
  const search = useSelector((state) => state.search.values.knowWays);

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
    filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filtered.map((i) => String(i.id)));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [branchId]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filtered.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filtered]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = ["#", "طريقة المعرفة", "الإجراءات"];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

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
          <PrintExportActions 
            data={filtered}
            selectedIds={selectedIds}
            columns={[
              { header: "طريقة المعرفة", key: "name" },
            ]}
            title="طرق المعرفة"
            filename="طرق_المعرفة"
          />
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
