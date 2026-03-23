"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ===== APIs =====
import {
  useGetCitiesQuery,
  useDeleteCityMutation,
} from "@/store/services/citiesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// ===== Components =====
import CitiesTable from "./components/CitiesTable";
import AddCityModal from "./components/AddCityModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function CitiesPage() {
  // ===== Redux (بحث + فلترة فرع من Navbar) =====
  const search = useSelector((state) => state.search.values.cities);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data, isLoading } = useGetCitiesQuery();
  const cities = data?.data || [];
  const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();

  // ===== Branches (للطباعة والاكسل) =====
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const getBranchName = (id) =>
    branches.find((b) => Number(b.id) === Number(id))?.name || "-";

  const getCityBranchId = (c) =>
    c?.institute_branch_id ??
    c?.branch_id ??
    c?.instituteBranchId ??
    c?.institute_branch?.id ??
    null;

  const getStatusLabel = (c) => (c?.is_active ? "نشط" : "غير نشط");

  // ===== Filtering =====
  const filteredCities = useMemo(() => {
    return cities.filter((c) => {
      const matchSearch = (c?.name || "")
        .toLowerCase()
        .includes((search || "").toLowerCase());

      const cityBranchId = getCityBranchId(c);
      const matchBranch =
        !branchId ||
        cityBranchId == null ||
        Number(branchId) === Number(cityBranchId);

      return matchSearch && matchBranch;
    });
  }, [cities, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    filteredCities.length > 0 && selectedIds.length === filteredCities.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredCities.map((c) => String(c.id)));
  };

  // تفريغ التحديد عند تغيير البحث أو الفرع
  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // تنظيف التحديد عند تغير البيانات
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredCities.some((c) => String(c.id) === String(id)),
      );

      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredCities]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = ["#", "اسم المدينة", "الوصف", "الحالة", "الإجراءات"];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedCity(filteredCities.find((c) => c.id === id) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (city) => {
    setCityToDelete(city);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!cityToDelete) return;

    try {
      await deleteCity(cityToDelete.id).unwrap();
      notify.success("تم حذف المدينة بنجاح");
      setIsDeleteOpen(false);
      setCityToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== String(cityToDelete.id)));
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
      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة مدينة"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedCity(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintExportActions 
            data={filteredCities}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم المدينة", key: "name" },
              { header: "الوصف", key: "description" },
              { 
                header: "الحالة", 
                key: "is_active", 
                render: (val) => (val ? "نشط" : "غير نشط") 
              },
            ]}
            title="قائمة المدن"
            filename="المدن"
          />
        </div>
      </div>

      {/* TABLE */}
      <CitiesTable
        cities={filteredCities}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddCityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        city={selectedCity}
        cities={cities}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف مدينة"
        description={`هل أنت متأكد من حذف المدينة ${cityToDelete?.name || ""}؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setCityToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
