"use client";

import { useMemo } from "react";
import DataTable from "@/components/common/DataTable";
import ActionsMenu from "@/components/common/ActionsMenu";
import {
  Edit,
  BookOpen,
  Layers,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

export default function TeachersTable({
  teachers = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onSelectTeacher,
  onEdit,
  onEditPhoto,
  onEditBatches,
  onEditSubjects,
  onDelete,
  openMenuId,
  setOpenMenuId,
}) {
  const columns = useMemo(() => [
    { 
      header: "الاسم", 
      key: "name", 
      render: (val) => <span className="font-medium">{val}</span> 
    },
    { 
      header: "الفرع", 
      key: "institute_branch", 
      render: (val) => val?.name || "—" 
    },
    { 
      header: "الاختصاص", 
      key: "specialization" 
    },
    { 
      header: "الهاتف", 
      key: "phone", 
      className: "ltr", 
      render: (val) => val || "—" 
    },
    { 
      header: "تاريخ التعيين", 
      key: "hire_date" 
    },
  ], []);

  const renderActions = (t, isMobile) => (
    <ActionsMenu
      menuId={`${isMobile ? "m-" : "d-"}${t.id}`}
      openMenuId={openMenuId}
      setOpenMenuId={setOpenMenuId}
      items={[
        {
          label: "تعديل البيانات",
          icon: Edit,
          onClick: () => onEdit?.(t),
        },
        {
          label: "ربط/تعديل المواد",
          icon: BookOpen,
          onClick: () => onEditSubjects?.(t),
        },
        {
          label: "ربط/تعديل الشعب",
          icon: Layers,
          onClick: () => onEditBatches?.(t),
        },
        {
          label: "تعديل الصورة",
          icon: ImageIcon,
          onClick: () => onEditPhoto?.(t),
        },
        {
          label: "حذف",
          icon: Trash2,
          danger: true,
          onClick: () => {
            setOpenMenuId?.(null);
            onDelete?.(t);
          },
        },
      ]}
    />
  );

  return (
    <DataTable
      data={teachers}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      onRowClick={onSelectTeacher}
      renderActions={renderActions}
      pageSize={4}
      emptyMessage="لا توجد بيانات."
    />
  );
}
