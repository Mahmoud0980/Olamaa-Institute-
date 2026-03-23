"use client";

import { useMemo } from "react";
import { Edit, BookOpen, Image as ImageIcon, Trash2 } from "lucide-react";
import DataTable from "@/components/common/DataTable";
import ActionsMenu from "@/components/common/ActionsMenu";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function EmployeesTable({
  employees = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onSelectEmployee,
  onEdit,
  onDelete,
  onEditBatches,
  onEditPhoto,
  openMenuId,
  setOpenMenuId,
}) {
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const getBranchName = (id) => branches.find((b) => b.id === id)?.name || "-";

  const columns = useMemo(() => [
    { 
      header: "الاسم", 
      key: "id", 
      render: (_, emp) => `${emp.first_name} ${emp.last_name}` 
    },
    { header: "الوظيفة", key: "job_title" },
    { 
      header: "رقم الهاتف", 
      key: "phone", 
      render: (val) => <span dir="ltr">{val}</span> 
    },
    { 
      header: "الفرع", 
      key: "institute_branch_id", 
      render: (id) => getBranchName(id) 
    },
    { 
      header: "الحالة", 
      key: "is_active", 
      render: (val) => (
        <span
          className={`px-3 py-1 text-xs rounded-xl ${
            val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {val ? "نشط" : "غير نشط"}
        </span>
      ),
    },
  ], [branches]);

  const renderActions = (emp, isMobile) => (
    <div onClick={(e) => e.stopPropagation()}>
      <ActionsMenu
        menuId={`emp${isMobile ? "-m" : ""}-${emp.id}`}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
        items={[
          {
            label: "تعديل البيانات",
            icon: Edit,
            onClick: () => onEdit?.(emp.id),
          },
          {
            label: "تعديل الصورة",
            icon: ImageIcon,
            onClick: () => onEditPhoto?.(emp.id),
          },
          {
            label: "الدورات",
            icon: BookOpen,
            onClick: () => onEditBatches?.(emp.id),
          },
          {
            label: "حذف",
            icon: Trash2,
            danger: true,
            onClick: () => onDelete?.(emp),
          },
        ]}
      />
    </div>
  );

  return (
    <DataTable
      data={employees}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      onRowClick={onSelectEmployee}
      onPageChange={() => setOpenMenuId?.(null)}
      renderActions={renderActions}
      pageSize={4}
      emptyMessage="لا يوجد موظفين."
    />
  );
}
