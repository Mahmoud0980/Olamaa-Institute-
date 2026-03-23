"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ================= API =================
import {
  useGetSubjectsQuery,
  useDeleteSubjectMutation,
  subjectsApi,
} from "@/store/services/subjectsApi";

import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";

// ================= Components =================
import SubjectsTable from "./components/SubjectsTable";
import AddSubjectModal from "./components/AddSubjectsModel";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import ActionsRow from "@/components/common/ActionsRow";
import Breadcrumb from "@/components/common/Breadcrumb";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function SubjectsPage() {
  const dispatch = useDispatch();

  // ===== Search + Branch from Navbar =====
  const search = useSelector((state) => state.search.values.subjects);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data: subjectsData, isLoading: isLoadingSubjects } = useGetSubjectsQuery();
  const subjects =
    (Array.isArray(subjectsData) ? subjectsData : subjectsData?.data) || [];

  const { data: academicData, isLoading: isLoadingAcademicBranches } = useGetAcademicBranchesQuery();
  const academicBranches = academicData?.data || [];

  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

  const isLoading = isLoadingSubjects || isLoadingAcademicBranches;

  const getAcademicName = (subject) => subject.academic_branch?.name || "-";

  // ===== Filtering =====
  const filteredSubjects = useMemo(() => {
    const q = (search || "").toLowerCase();

    return subjects.filter((s) => {
      const matchSearch =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q);

      const subjectBranch = s.institute_branch_id ?? s.branch_id ?? null;

      const matchBranch =
        !branchId || subjectBranch == null
          ? true
          : Number(branchId) === Number(subjectBranch);

      return matchSearch && matchBranch;
    });
  }, [subjects, search, branchId]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, branchId]);

  const isAllSelected =
    filteredSubjects.length > 0 &&
    selectedIds.length === filteredSubjects.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredSubjects.map((s) => String(s.id)));
  };

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState("single");
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setEditingSubject(filteredSubjects.find((s) => String(s.id) === String(id)));
    setIsModalOpen(true);
  };

  const handleAskDeleteOne = (subject) => {
    setSubjectToDelete(subject);
    setDeleteMode("single");
    setIsDeleteOpen(true);
  };

  const handleAskDeleteMultiple = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد مادة واحدة على الأقل");
      return;
    }
    setDeleteMode("multiple");
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteMode === "single") {
        await deleteSubject(subjectToDelete.id).unwrap();
      } else {
        await Promise.all(selectedIds.map((id) => deleteSubject(id).unwrap()));
      }

      notify.success("تم الحذف بنجاح");
      setSelectedIds([]);
      setIsDeleteOpen(false);

      dispatch(
        subjectsApi.util.invalidateTags([{ type: "Subjects", id: "LIST" }]),
      );
    } catch (err) {
      notify.error(err?.data?.message || "حدث خطأ أثناء الحذف");
    }
  };

  if (isLoading) {
    return (
      <PageSkeleton
        tableHeaders={["#", "اسم المادة", "الفرع الأكاديمي", "الوصف", "الإجراءات"]}
      />
    );
  }

  // ================= RENDER =================
  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-700">
          الجداول الرئيسية
        </h1>
        <Breadcrumb />
      </div>

      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة مادة"
          showSelectAll
          viewLabel=""
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onDeleteMultiple={handleAskDeleteMultiple}
          disableDelete={selectedIds.length === 0}
          onAdd={() => {
            setEditingSubject(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintExportActions 
            data={filteredSubjects}
            selectedIds={selectedIds}
            columns={[
              { header: "اسم المادة", key: "name" },
              { 
                header: "الفرع الأكاديمي", 
                key: "academic_branch", 
                render: (_, row) => getAcademicName(row) 
              },
              { header: "الوصف", key: "description" },
            ]}
            title="قائمة المواد"
            filename="المواد"
          />
        </div>
      </div>

      <SubjectsTable
        subjects={filteredSubjects}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={handleEdit}
        onDelete={handleAskDeleteOne}
      />

      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject={editingSubject}
        subjects={subjects}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف المواد المحددة؟"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
