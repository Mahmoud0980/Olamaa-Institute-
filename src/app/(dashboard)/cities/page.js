"use client";

import { useState } from "react";
import { Plus, List } from "lucide-react";
import {
  useGetCitiesQuery,
  useDeleteCityMutation,
} from "@/store/services/citiesApi";

import CitiesTable from "./components/CitiesTable";
import AddCityModal from "./components/AddCityModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";

import toast from "react-hot-toast";

export default function CitiesPage() {
  const { data, isLoading } = useGetCitiesQuery();
  const [deleteCity] = useDeleteCityMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCity, setSelectedCity] = useState(null);

  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);

  const handleEdit = (id) => {
    const found = data?.data?.find((c) => c.id === id);
    setSelectedCity(found);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const found = data?.data?.find((c) => c.id === id);
    setSelectedCity(found);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCity(selectedCity.id).unwrap();
      toast.success("تم حذف المدينة بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }

    setIsDeleteOpen(false);
    setSelectedCity(null);
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">المدن</h1>
          <p className="text-gray-500 text-sm">إدارة بيانات المدن</p>
        </div>

        {/* البحث يظهر فقط بعد عرض البيانات */}
      </div>

      {/* الأزرار */}
      <div className="w-full flex justify-between items-center flex-wrap gap-3">
        <div className="flex gap-2">
          <ActionsRow
            addLabel="إضافة مدينة"
            viewLabel="عرض بيانات المدن"
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
            placeholder="ابحث عن مدينة..."
            className="border px-3 py-2 rounded-lg text-sm w-64 
            focus:border-[#6F013F] focus:ring-1 focus:ring-pink-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {/* الجدول */}
      {showTable && (
        <CitiesTable
          cities={data?.data || []}
          isLoading={isLoading}
          search={search}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* المودالات */}
      <AddCityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        city={selectedCity}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
