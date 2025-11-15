"use client";

import { useState } from "react";
import {
  useGetBatchesQuery,
  useDeleteBatchMutation,
} from "@/store/services/batchesApi";

import BatchesTable from "./components/BatchesTable";
import AddBatchModal from "./components/AddBatchModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";

import toast from "react-hot-toast";

export default function BatchesPage() {
  const { data, isLoading } = useGetBatchesQuery();
  const [deleteBatch] = useDeleteBatchMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);

  const handleEdit = (id) => {
    const found = data?.data?.find((b) => b.id === id);
    setSelectedBatch(found);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const found = data?.data?.find((b) => b.id === id);
    setSelectedBatch(found);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBatch(selectedBatch.id).unwrap();
      toast.success("تم حذف الشعبة بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }

    setIsDeleteOpen(false);
    setSelectedBatch(null);
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">الشُعَب</h1>
          <p className="text-gray-500 text-sm">إدارة بيانات الشعب</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2">
          <ActionsRow
            addLabel="إضافة شعبة"
            viewLabel="عرض بيانات الشعب"
            onAdd={() => {
              setSelectedBatch(null);
              setIsModalOpen(true);
            }}
            onView={() => setShowTable(true)}
            showSelectAll={false}
          />
        </div>

        {showTable && (
          <input
            type="text"
            placeholder="ابحث عن شعبة..."
            className="border px-3 py-2 rounded-lg text-sm w-64 
              focus:border-[#6F013F] focus:ring-1 focus:ring-pink-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {/* TABLE */}
      {showTable && (
        <BatchesTable
          batches={data?.data || []}
          isLoading={isLoading}
          search={search}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* MODALS */}
      <AddBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        batch={selectedBatch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
