"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";

import TeachersTable from "./components/TeachersTable";
import CoursesTable from "./components/CoursesTable";

import AddTeacherModal from "./components/AddTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal";
import EditTeacherPhotoModal from "./components/EditTeacherPhotoModal";
import EditTeacherSubjectsModal from "./components/EditTeacherSubjectsModal";
import EditTeacherBatchesModal from "./components/EditTeacherBatchesModal";

import { useGetTeachersQuery } from "@/store/services/teachersApi";
import TeachersPageSkeleton from "./components/TeachersPageSkeleton";
import { useGetSubjectsQuery } from "@/store/services/subjectsApi";

export default function TeachersPage() {
  const [openMenuId, setOpenMenuId] = useState(null);

  const { data, isLoading } = useGetTeachersQuery();
  const teachers = data?.data || [];

  const search = useSelector((state) => state.search?.values?.teachers) || "";

  const { data: subjectsData } = useGetSubjectsQuery();
  const subjects = subjectsData || [];

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) =>
      (t.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [batchesOpen, setBatchesOpen] = useState(false);

  const [activeTeacher, setActiveTeacher] = useState(null);

  if (isLoading) return <TeachersPageSkeleton />;

  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <ActionsRow addLabel="إضافة أستاذ" onAdd={() => setAddOpen(true)} />
        <div className="flex gap-2">
          <PrintButton />
          <ExcelButton />
        </div>
      </div>

      {/* content */}
      <div className="w-full flex flex-col gap-6">
        <TeachersTable
          teachers={filteredTeachers}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onSelectTeacher={setSelectedTeacher}
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
          onDelete={(t) => console.log("DELETE", t)}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
        />

        <CoursesTable selectedTeacher={selectedTeacher} />
      </div>

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
