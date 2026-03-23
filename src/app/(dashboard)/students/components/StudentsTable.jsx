"use client";

import { useMemo, useState } from "react";
import DataTable from "@/components/common/DataTable";
import ActionsMenu from "@/components/common/ActionsMenu";

/* ================= helpers ================= */
const genderLabel = (g) => {
  if (g === "male") return "ذكر";
  if (g === "female") return "أنثى";
  return "—";
};

const guardianFullName = (g) => {
  if (!g) return "—";
  const f = String(g.first_name || "").trim();
  const l = String(g.last_name || "").trim();
  const full = `${f} ${l}`.trim();
  return full || "—";
};

const getFatherName = (row) => {
  const gs = row?.family?.guardians || [];
  const father = gs.find((g) => g.relationship === "father");
  return guardianFullName(father);
};

const getMotherName = (row) => {
  const gs = row?.family?.guardians || [];
  const mother = gs.find((g) => g.relationship === "mother");
  return guardianFullName(mother);
};

/* ================= component ================= */
export default function StudentsTable({
  students = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,
  onAddToBatch,
  onViewDetails,
  onEditStudentInfo,
  onEditFamily,
  onEditAcademic,
  onEditContacts,
  onAddContract,
  onDeleteStudent,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuItems = useMemo(() => {
    return (row) => [
      {
        label: "عرض تفاصيل الطالب",
        onClick: () => onViewDetails?.(row),
      },
      {
        label: "تعديل بيانات الطالب",
        onClick: () => onEditStudentInfo?.(row),
      },
      {
        label: "تعديل بيانات العائلة",
        onClick: () => onEditFamily?.(row),
      },
      {
        label: "تعديل المعلومات الأكاديمية",
        onClick: () => onEditAcademic?.(row),
      },
      {
        label: "تعديل معلومات التواصل",
        onClick: () => onEditContacts?.(row),
      },
      {
        label: "إضافة الطالب إلى شعبة",
        onClick: () => onAddToBatch?.(row),
      },
      {
        label: row.enrollment_contract ? "عرض بيانات العقد" : "إضافة عقد للطالب",
        onClick: () => onAddContract?.(row),
      },
      {
        label: "حذف الطالب",
        danger: true,
        onClick: () => onDeleteStudent?.(row),
      },
    ];
  }, [
    onViewDetails,
    onEditStudentInfo,
    onEditFamily,
    onEditAcademic,
    onEditContacts,
    onAddToBatch,
    onAddContract,
    onDeleteStudent,
  ]);

  const columns = useMemo(() => [
    { header: "الاسم", key: "first_name" },
    { header: "الكنية", key: "last_name" },
    { header: "اسم الأب", key: "id", render: (_, row) => getFatherName(row) },
    { header: "اسم الأم", key: "id", render: (_, row) => getMotherName(row) },
    { header: "الجنس", key: "gender", render: (val) => genderLabel(val) },
    { header: "فرع المعهد", key: "institute_branch", render: (val) => val?.name ?? "—" },
    { header: "الشعبة", key: "batch", render: (val) => val?.name ?? "—" },
  ], []);

  const renderActions = (row, isMobile) => (
    <ActionsMenu
      menuId={`student${isMobile ? "-m" : ""}-${row.id}`}
      openMenuId={openMenuId}
      setOpenMenuId={setOpenMenuId}
      items={menuItems(row)}
    />
  );

  return (
    <DataTable
      data={students}
      columns={columns}
      isLoading={isLoading}
      selectedIds={selectedIds}
      onSelectChange={onSelectChange}
      renderActions={renderActions}
      pageSize={4}
      emptyMessage="لا يوجد طلاب."
    />
  );
}
