"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";

// API
import {
  useGetEmployeesWithBatchesQuery,
  useDeleteEmployeeMutation,
} from "@/store/services/employeesApi";

// Components
import EmployeesTable from "./components/EmployeesTable";
import AddEmployeeModal from "./components/AddEmployeeModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import BatchesBox from "./components/BatchesBox";
import AssignBatchModal from "./components/AssignBatchModal";

import ActionsRow from "@/components/common/ActionsRow";
import EditEmployeePhotoModal from "./components/EditEmployeePhotoModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function EmployeesPage({ openAddFromUrl }) {
  // ===== API =====
  const { data, isLoading } = useGetEmployeesWithBatchesQuery();
  const employees = data?.data || [];

  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  // ===== Redux filters =====
  const search = useSelector((state) => state.search.values.employees || "");
  const branch = useSelector((state) => state.search.values.branch || "");

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(openAddFromUrl);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployeeForBatchesModal, setSelectedEmployeeForBatchesModal] =
    useState(null);

  const [selectedEmployeeForBatches, setSelectedEmployeeForBatches] =
    useState(null);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedEmployeeForPhoto, setSelectedEmployeeForPhoto] =
    useState(null);

  useEffect(() => {
    if (openAddFromUrl) {
      setSelectedEmployee(null);
      setIsModalOpen(true);
    }
  }, [openAddFromUrl]);

  // ===== Filtering =====
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const matchSearch = fullName.includes(search.toLowerCase());
      const matchBranch = !branch || emp.institute_branch_id === Number(branch);
      return matchSearch && matchBranch;
    });
  }, [employees, search, branch]);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, branch]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredEmployees.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredEmployees]);

  if (isLoading) {
    const tableHeaders = [
      "#",
      "الاسم",
      "الوظيفة",
      "رقم الهاتف",
      "الفرع",
      "الحالة",
      "الإجراءات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  const isAllSelected =
    filteredEmployees.length > 0 &&
    selectedIds.length === filteredEmployees.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      setSelectedEmployeeForBatches(null);
    } else {
      setSelectedIds(filteredEmployees.map((e) => String(e.id)));
      setSelectedEmployeeForBatches(null);
    }
  };

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedEmployee(employees.find((e) => String(e.id) === String(id)) || null);
    setIsModalOpen(true);
  };

  const handleEditBatches = (id) => {
    setSelectedEmployeeForBatchesModal(
      employees.find((e) => String(e.id) === String(id)) || null,
    );
    setIsAssignModalOpen(true);
  };

  const handleDeleteEmployee = (emp) => {
    setEmployeeToDelete(emp);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id).unwrap();
      notify.success("تم حذف الموظف بنجاح");
      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل في حذف الموظف");
    }
  };

  const handleEditPhoto = (id) => {
    const found = employees.find((e) => String(e.id) === String(id));
    setSelectedEmployeeForPhoto(found || null);
    setIsPhotoModalOpen(true);
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">
            الموظفين
          </h1>
          <Breadcrumb />
        </div>
      </div>
      {/* ACTIONS */}
      <div className="w-full flex justify-between items-center gap-3">
        <ActionsRow
          addLabel="إضافة موظف"
          showSelectAll
          viewLabel=""
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedEmployee(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintExportActions 
            data={filteredEmployees}
            selectedIds={selectedIds}
            columns={[
              { 
                header: "الاسم", 
                key: "first_name",
              },
              { 
                header: "الكنية", 
                key: "last_name",
              },
              { header: "الوظيفة", key: "job_title" },
              { header: "الهاتف", key: "phone" },
              { 
                header: "الفرع", 
                key: "institute_branch",
                render: (val) => val?.name || "-"
              },
              { 
                header: "الحالة", 
                key: "is_active",
                render: (val) => (val ? "نشط" : "غير نشط")
              },
            ]}
            title="قائمة الموظفين"
            filename="الموظفين"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full mt-6 flex flex-col md:flex-row gap-6">
        <EmployeesTable
          employees={filteredEmployees}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEdit}
          onEditBatches={handleEditBatches}
          onSelectEmployee={setSelectedEmployeeForBatches}
          onEditPhoto={handleEditPhoto}
          onDelete={handleDeleteEmployee}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
        />

        <BatchesBox selectedEmployee={selectedEmployeeForBatches} />
      </div>

      {/* MODALS */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      <AssignBatchModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        employee={selectedEmployeeForBatchesModal}
      />

      <EditEmployeePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        employee={selectedEmployeeForPhoto}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف موظف"
        description={`هل أنت متأكد من حذف الموظف ${employeeToDelete?.first_name} ${employeeToDelete?.last_name}؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
