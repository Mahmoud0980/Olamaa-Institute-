"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  useGetSchoolsQuery,
  useDeleteSchoolMutation,
} from "@/store/services/schoolsApi";

import SchoolsTable from "./components/SchoolsTable";
import AddSchoolModal from "./components/AddSchoolModal";

import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

const typeLabel = (t) => {
  if (t === "public") return "حكومية";
  if (t === "private") return "خاصة";
  return t ?? "-";
};

const statusLabel = (v) => (v ? "مفعلة" : "متوقفة");

export default function SchoolsPage() {
  // ===== بحث من Navbar =====
  const search = useSelector((state) => state.search?.values?.schools || "");

  // ===== Data =====
  const { data, isLoading } = useGetSchoolsQuery();
  const schools = data?.data || [];

  const [deleteSchool, { isLoading: isDeleting }] = useDeleteSchoolMutation();

  // ===== Filtering =====
  const filteredSchools = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    if (!q) return schools;

    return schools.filter((row) => {
      const name = (row?.name ?? "").toLowerCase();
      const city = (row?.city ?? "").toLowerCase();
      const notes = (row?.notes ?? "").toLowerCase();
      const type = (row?.type ?? "").toLowerCase();
      return (
        name.includes(q) ||
        city.includes(q) ||
        notes.includes(q) ||
        type.includes(q)
      );
    });
  }, [schools, search]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    filteredSchools.length > 0 && selectedIds.length === filteredSchools.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredSchools.map((r) => String(r.id)));
  };

  // تفريغ التحديد عند تغير البحث
  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // تنظيف التحديد إذا انحذفت عناصر أو تغيرت الداتا (بدون infinite loop)
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) =>
        filteredSchools.some((r) => String(r.id) === id),
      );
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [filteredSchools]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = [
      "#",
      "اسم المدرسة",
      "النوع",
      "المدينة",
      "الملاحظات",
      "الحالة",
      "الإجراءات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  // ===== Actions =====
  const handleEdit = (id) => {
    setSelectedSchool(filteredSchools.find((r) => String(r.id) === String(id)) || null);
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setSchoolToDelete(row);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!schoolToDelete) return;

    try {
      await deleteSchool(schoolToDelete.id).unwrap();
      toast.success("تم حذف المدرسة بنجاح");
      setIsDeleteOpen(false);
      setSchoolToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.data?.message || "حدث خطأ أثناء الحذف");
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
      <div className="flex justify-between items-center flex-wrap gap-3">
        <ActionsRow
          addLabel="إضافة مدرسة"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setSelectedSchool(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintExportActions 
            data={filteredSchools}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم المدرسة", key: "name" },
              { 
                header: "النوع", 
                key: "type",
                render: typeLabel
              },
              { header: "المدينة", key: "city" },
              { header: "الملاحظات", key: "notes" },
              { 
                header: "الحالة", 
                key: "is_active",
                render: statusLabel
              },
            ]}
            title="قائمة المدارس"
            filename="المدارس"
          />
        </div>
      </div>

      {/* TABLE */}
      <SchoolsTable
        schools={filteredSchools}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODALS */}
      <AddSchoolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        school={selectedSchool}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف مدرسة"
        description={`هل أنت متأكد من حذف المدرسة ${
          schoolToDelete?.name || ""
        }؟`}
        onClose={() => {
          setIsDeleteOpen(false);
          setSchoolToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
