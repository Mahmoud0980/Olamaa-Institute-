"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";

// APIs
import {
  useGetBusesQuery,
  useDeleteBusMutation,
} from "@/store/services/busesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// Components
import BusesTable from "./components/BusesTable";
import AddBusModal from "./components/AddBusModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function BusesPage() {
  // ===== Redux (بحث + فلترة فرع من Navbar) =====
  const search = useSelector((state) => state.search.values.buses);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data, isLoading } = useGetBusesQuery();
  const buses = data?.data || [];

  const [deleteBus, { isLoading: isDeleting }] = useDeleteBusMutation();

  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];
  
  const getBranchName = (id) =>
    branches.find((b) => Number(b.id) === Number(id))?.name || "-";

  const getBusBranchId = (bus) =>
    bus?.institute_branch_id ??
    bus?.branch_id ??
    bus?.instituteBranchId ??
    bus?.branchId ??
    null;

  // ===== Filtering =====
  const filteredBuses = useMemo(() => {
    return buses.filter((b) => {
      const matchSearch = (b?.name || "")
        .toLowerCase()
        .includes((search || "").toLowerCase());

      const busBranchId = getBusBranchId(b);
      const matchBranch =
        !branchId ||
        busBranchId == null ||
        Number(branchId) === Number(busBranchId);

      return matchSearch && matchBranch;
    });
  }, [buses, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    filteredBuses.length > 0 && selectedIds.length === filteredBuses.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredBuses.map((b) => String(b.id)));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // تنظيف التحديد إذا انحذف عنصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredBuses.some((b) => String(b.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredBuses]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = [
      "#",
      "اسم الباص",
      "السعة",
      "اسم السائق",
      "وصف الطريق",
      "الحالة",
      "الإجراءات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedBus(filteredBuses.find((b) => String(b.id) === String(id)) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (bus) => {
    setBusToDelete(bus);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!busToDelete) return;

    try {
      await deleteBus(busToDelete.id).unwrap();
      notify.success("تم حذف الباص بنجاح");
      setIsDeleteOpen(false);
      setBusToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== String(busToDelete.id)));
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
          addLabel="إضافة باص"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedBus(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintExportActions 
            data={filteredBuses}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم الباص", key: "name" },
              { header: "السعة", key: "capacity" },
              { header: "اسم السائق", key: "driver_name" },
              { header: "وصف الطريق", key: "route_description" },
              { 
                header: "الفرع", 
                key: "institute_branch_id",
                render: getBranchName
              },
              { 
                header: "الحالة", 
                key: "is_active",
                render: (val) => (val ? "نشط" : "غير نشط")
              },
            ]}
            title="قائمة الباصات"
            filename="الباصات"
          />
        </div>
      </div>

      {/* TABLE */}
      <BusesTable
        buses={filteredBuses}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddBusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bus={selectedBus}
        buses={buses}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف باص"
        description={`هل أنت متأكد من حذف الباص ${busToDelete?.name || ""}؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setBusToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
