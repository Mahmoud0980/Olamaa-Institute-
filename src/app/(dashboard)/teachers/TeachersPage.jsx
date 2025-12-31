"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";

import TeachersTable from "./components/TeachersTable";
import CoursesTable from "./components/CoursesTable";

import AddTeacherModal from "./components/steps/AddTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal";
import EditTeacherPhotoModal from "./components/EditTeacherPhotoModal";
import EditTeacherSubjectsModal from "./components/EditTeacherSubjectsModal";
import EditTeacherBatchesModal from "./components/EditTeacherBatchesModal";

import {
  useGetTeachersQuery,
  useLazyGetTeacherBatchesDetailsQuery,
} from "@/store/services/teachersApi";

import { useGetSubjectsQuery } from "@/store/services/subjectsApi";
import TeachersPageSkeleton from "./components/TeachersPageSkeleton";

export default function TeachersPage({ openAddFromUrl }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  // ===== API =====
  const { data, isLoading } = useGetTeachersQuery();
  const teachers = data?.data || [];

  const { data: subjectsData } = useGetSubjectsQuery();
  const subjects = subjectsData || [];

  // ===== Filters =====
  const search = useSelector((s) => s.search?.values?.teachers) || "";
  const branchId = useSelector((s) => s.search?.values?.branch) || "";

  const filteredTeachers = useMemo(() => {
    const s = search.toLowerCase();
    return teachers
      .filter((t) => (t.name || "").toLowerCase().includes(s))
      .filter((t) => {
        if (!branchId) return true;
        const tBranchId = t?.institute_branch?.id ?? t?.institute_branch_id;
        return String(tBranchId) === String(branchId);
      });
  }, [teachers, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const isAllSelected =
    filteredTeachers.length > 0 &&
    selectedIds.length === filteredTeachers.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredTeachers.map((t) => t.id));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  // ===== Modals =====
  const [addOpen, setAddOpen] = useState(openAddFromUrl);
  const [editOpen, setEditOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [batchesOpen, setBatchesOpen] = useState(false);
  const [activeTeacher, setActiveTeacher] = useState(null);

  useEffect(() => {
    if (openAddFromUrl) setAddOpen(true);
  }, [openAddFromUrl]);

  const handleBackFromDetails = () => {
    setSelectedTeacher(null);
    setOpenMenuId(null);
  };

  // ===== Lazy details =====
  const [fetchTeacherDetails] = useLazyGetTeacherBatchesDetailsQuery();

  const normalizeArray = (res) =>
    Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

  const getTeacherAllRows = async (id) => {
    const res = await fetchTeacherDetails({ id, type: "all" }, true).unwrap();
    return normalizeArray(res);
  };

  // ===== Print =====
  const handlePrint = async () => {
    const ids = selectedTeacher ? [selectedTeacher.id] : selectedIds;
    if (!ids.length) return toast.error("حدد مدرس واحد على الأقل");

    try {
      const teachersMap = new Map(teachers.map((t) => [t.id, t]));
      for (const id of ids) {
        await getTeacherAllRows(id);
      }
      window.print();
    } catch {
      toast.error("فشلت الطباعة");
    }
  };

  // ===== Excel =====
  const handleExcel = async () => {
    const ids = selectedTeacher ? [selectedTeacher.id] : selectedIds;
    if (!ids.length) return toast.error("حدد مدرس واحد على الأقل");

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(teachers.filter((t) => ids.includes(t.id))),
      "Teachers"
    );

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "teachers.xlsx");
  };

  if (isLoading) return <TeachersPageSkeleton />;

  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة أستاذ"
          viewLabel=""
          onAdd={() => setAddOpen(true)}
          showSelectAll={!selectedTeacher}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          selectAllLabel="تحديد الكل"
        />
        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* Content */}
      {selectedTeacher ? (
        <CoursesTable
          selectedTeacher={selectedTeacher}
          onBack={handleBackFromDetails}
        />
      ) : (
        <TeachersTable
          teachers={filteredTeachers}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onSelectTeacher={setSelectedTeacher}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          onEdit={(t) => {
            setActiveTeacher(t);
            setEditOpen(true);
          }}
          onEditPhoto={(t) => {
            setActiveTeacher(t);
            setPhotoOpen(true);
          }}
          onEditSubjects={(t) => {
            setActiveTeacher(t);
            setSubjectsOpen(true);
          }}
          onEditBatches={(t) => {
            setActiveTeacher(t);
            setBatchesOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <AddTeacherModal isOpen={addOpen} onClose={() => setAddOpen(false)} />

      <EditTeacherModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        teacher={activeTeacher}
      />

      <EditTeacherPhotoModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        teacher={activeTeacher}
      />

      <EditTeacherSubjectsModal
        isOpen={subjectsOpen}
        onClose={() => setSubjectsOpen(false)}
        teacher={activeTeacher}
        subjects={subjects}
      />

      <EditTeacherBatchesModal
        isOpen={batchesOpen}
        onClose={() => setBatchesOpen(false)}
        teacher={activeTeacher}
      />
    </div>
  );
}
