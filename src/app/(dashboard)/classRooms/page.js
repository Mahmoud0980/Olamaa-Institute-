"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";

import {
  useGetClassRoomsQuery,
  useDeleteClassRoomMutation,
} from "@/store/services/classRoomsApi";

import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

import ClassRoomsTable from "./components/ClassRoomsTable";
import AddClassRoomModal from "./components/AddClassRoomModal";

export default function ClassRoomsPage() {
  const { data, isLoading } = useGetClassRoomsQuery();
  const rooms = data?.data || [];

  const search = useSelector((state) => state.search.values.classRooms);

  const [deleteRoom, { isLoading: deleting }] = useDeleteClassRoomMutation();

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  // ===== Filtering =====
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) =>
      room.name?.toLowerCase().includes((search || "").toLowerCase()),
    );
  }, [rooms, search]);

  // تنظيف التحديد عند تغير البحث
  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  const isAllSelected =
    filteredRooms.length > 0 && selectedIds.length === filteredRooms.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredRooms.map((r) => String(r.id)));
  };

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredRooms.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredRooms]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = ["#", "الاسم", "الكود", "السعة", "ملاحظات", "الإجراءات"];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRoom(itemToDelete.id).unwrap();
      notify.success("تم حذف القاعة بنجاح");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل حذف القاعة");
    }
  };

  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      <Breadcrumb />

      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة قاعة"
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
            data={filteredRooms}
            selectedIds={selectedIds}
            columns={[
              { header: "الاسم", key: "name" },
              { header: "الكود", key: "code" },
              { header: "السعة", key: "capacity" },
              { header: "ملاحظات", key: "notes" },
            ]}
            title="القاعات"
            filename="القاعات"
          />
        </div>
      </div>

      <ClassRoomsTable
        data={filteredRooms}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={(item) => {
          setEditItem(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <AddClassRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editItem}
        rooms={rooms}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={deleting}
        title="حذف قاعة"
        description={`هل أنت متأكد من حذف القاعة ${itemToDelete?.name}؟`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
