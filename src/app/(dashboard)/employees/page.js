"use client";

import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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

import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import ActionsRow from "@/components/common/ActionsRow";
import EditEmployeePhotoModal from "./components/EditEmployeePhotoModal";

export default function EmployeesPage() {
  // ===== API =====
  const { data, isLoading } = useGetEmployeesWithBatchesQuery();
  // const [deleteEmployee] = useDeleteEmployeeMutation();
  const employees = data?.data || [];
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  // ===== Redux filters =====
  const search = useSelector((state) => state.search.values.employees);
  const branch = useSelector((state) => state.search.values.branch);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  // ===== Filtering =====
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
      const matchSearch = fullName.includes(search.toLowerCase());
      const matchBranch = !branch || emp.institute_branch_id === Number(branch);

      return matchSearch && matchBranch;
    });
  }, [employees, search, branch]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEmployeeForBatchesModal, setSelectedEmployeeForBatchesModal] =
    useState(null);

  const [selectedEmployeeForBatches, setSelectedEmployeeForBatches] =
    useState(null);
  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filteredEmployees.length;
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedEmployeeForPhoto, setSelectedEmployeeForPhoto] =
    useState(null);
  const handleEditPhoto = (id) => {
    const found = employees.find((e) => e.id === id);
    setSelectedEmployeeForPhoto(found || null);
    setIsPhotoModalOpen(true);
  };
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      setSelectedEmployeeForBatches(null);
    } else {
      setSelectedIds(filteredEmployees.map((e) => e.id));
      setSelectedEmployeeForBatches(null);
    }
  };

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedEmployee(employees.find((e) => e.id === id) || null);
    setIsModalOpen(true);
  };

  const handleEditBatches = (id) => {
    setSelectedEmployeeForBatchesModal(
      employees.find((e) => e.id === id) || null
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

      toast.success("تم حذف الموظف بنجاح");

      setIsDeleteOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error("DELETE ERROR:", err);

      toast.error(err?.data?.message || "فشل في حذف الموظف");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد موظف واحد على الأقل");
      return;
    }

    const rows = filteredEmployees.filter((e) => selectedIds.includes(e.id));

    const html = `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: right; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h3>قائمة الموظفين</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم</th>
                <th>الكنية</th>
                <th>الوظيفة</th>
                <th>الهاتف</th>
                <th>الفرع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (e, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${e.first_name}</td>
                  <td>${e.last_name}</td>
                  <td>${e.job_title}</td>
                  <td>${e.phone}</td>
                  <td>${e.institute_branch?.name || "-"}</td>
                  <td>${e.is_active ? "نشط" : "غير نشط"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد موظف واحد على الأقل");
      return;
    }

    const rows = filteredEmployees
      .filter((e) => selectedIds.includes(e.id))
      .map((e) => ({
        الاسم: e.first_name,
        الكنية: e.last_name,
        الوظيفة: e.job_title,
        الهاتف: e.phone,
        الفرع: e.institute_branch?.name || "-",
        الحالة: e.is_active ? "نشط" : "غير نشط",
      }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "employees.xlsx"
    );
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col items-center">
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
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
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
        />

        <BatchesBox selectedEmployee={selectedEmployeeForBatches} />
      </div>

      {/* MODALS */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
