"use client";

import { useState } from "react";
import {
  useGetBusesQuery,
  useDeleteBusMutation,
} from "@/store/services/busesApi";

import BusesTable from "./components/BusesTable";
import AddBusModal from "./components/AddBusModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";

import toast from "react-hot-toast";

export default function BusesPage() {
  const { data, isLoading } = useGetBusesQuery();
  const [deleteBus] = useDeleteBusMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedBus, setSelectedBus] = useState(null);

  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);

  const handleEdit = (id) => {
    const found = data?.data?.find((b) => b.id === id);
    setSelectedBus(found);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const found = data?.data?.find((b) => b.id === id);
    setSelectedBus(found);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBus(selectedBus.id).unwrap();
      toast.success("تم حذف الباص بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }

    setIsDeleteOpen(false);
    setSelectedBus(null);
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">الباصات</h1>
          <p className="text-gray-500 text-sm">إدارة بيانات الباصات</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2">
          <ActionsRow
            addLabel="إضافة باص"
            viewLabel="عرض بيانات الباصات"
            onAdd={() => {
              setSelectedBus(null);
              setIsModalOpen(true);
            }}
            onView={() => setShowTable(true)}
            showSelectAll={false}
          />
        </div>

        {showTable && (
          <input
            type="text"
            placeholder="ابحث عن باص..."
            className="border px-3 py-2 rounded-lg text-sm w-64 
              focus:border-[#6F013F] focus:ring-1 focus:ring-pink-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {/* TABLE */}
      {showTable && (
        <BusesTable
          buses={data?.data || []}
          isLoading={isLoading}
          search={search}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* MODALS */}
      <AddBusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bus={selectedBus}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
