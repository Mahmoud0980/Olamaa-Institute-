"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import {
  useGetAcademicBranchesQuery,
  useDeleteAcademicBranchMutation,
} from "@/store/services/academicBranchesApi";

import AcademicBranchesTable from "./components/AcademicBranchesTable";
import AddAcademicBranchModal from "./components/AddAcademicBranchModal";
import DeleteAcademicBranchModal from "./components/DeleteAcademicBranchModal";
import ActionsRow from "@/components/common/ActionsRow";

export default function AcademicBranchesPage() {
  const { data, isLoading } = useGetAcademicBranchesQuery();
  const [deleteAcademicBranch] = useDeleteAcademicBranchMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState(null);

  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);

  const handleEdit = (id) => {
    const found = data?.data?.find((b) => b.id === id);
    setSelectedBranch(found);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const found = data?.data?.find((b) => b.id === id);
    setSelectedBranch(found);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAcademicBranch(selectedBranch.id).unwrap();
      toast.success("تم حذف الفرع الأكاديمي بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }

    setIsDeleteOpen(false);
    setSelectedBranch(null);
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">
            الفروع الأكاديمية
          </h1>
          <p className="text-gray-500 text-sm">إدارة الفروع الأكاديمية</p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        <ActionsRow
          addLabel="إضافة فرع أكاديمي"
          viewLabel="عرض البيانات"
          onAdd={() => {
            setSelectedBranch(null);
            setIsModalOpen(true);
          }}
          onView={() => setShowTable(true)}
          showSelectAll={false}
        />

        {showTable && (
          <input
            type="text"
            placeholder="ابحث..."
            className="border px-3 py-2 rounded-lg text-sm w-64 
              focus:border-[#6F013F] focus:ring-1 focus:ring-pink-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {/* TABLE */}
      {showTable && (
        <AcademicBranchesTable
          branches={data?.data || []}
          isLoading={isLoading}
          search={search}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* MODALS */}
      <AddAcademicBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={selectedBranch}
      />

      <DeleteAcademicBranchModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
