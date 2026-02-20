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
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function SubjectsPage() {
  const dispatch = useDispatch();

  // ===== Search + Branch from Navbar =====
  const search = useSelector((state) => state.search.values.subjects);
  const branchId = useSelector((state) => state.search.values.branch);

  // ===== Data =====
  const { data: subjectsData, isLoading } = useGetSubjectsQuery();
  const subjects =
    (Array.isArray(subjectsData) ? subjectsData : subjectsData?.data) || [];

  const [deleteSubject, { isLoading: isDeleting }] = useDeleteSubjectMutation();

  const { data: academicData } = useGetAcademicBranchesQuery();
  const academicBranches = academicData?.data || [];

  // const getAcademicName = (id) =>
  //   academicBranches.find((a) => a.id === id)?.name || "-";
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
    setSelectedIds(isAllSelected ? [] : filteredSubjects.map((s) => s.id));
  };

  const selectedRows = filteredSubjects.filter((s) =>
    selectedIds.includes(s.id),
  );

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState("single");
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  // ===== Actions =====
  const handleEdit = (id) => {
    setEditingSubject(filteredSubjects.find((s) => s.id === id));
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

  // ================= PRINT =================
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد مادة واحدة على الأقل للطباعة");
      return;
    }

    const html = `
    <html dir="rtl">
      <head>
        <style>
          body { font-family: Arial; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            border: 1px solid #ccc;
            padding: 6px;
            font-size: 12px;
            text-align: right;
          }
          th { background: #f3f3f3; }
        </style>
      </head>
      <body>
        <h3>قائمة المواد</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>اسم المادة</th>
              <th>الفرع الأكاديمي</th>
              <th>الوصف</th>
            </tr>
          </thead>
          <tbody>
            ${selectedRows
              .map(
                (s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${s.name}</td>
                <td>${getAcademicName(s)}</td>
                <td>${s.description || "-"}</td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
    `;

    const win = window.open("", "", "width=1200,height=800");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ================= EXCEL =================
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد مادة واحدة على الأقل للتصدير");
      return;
    }

    const rows = selectedRows.map((s) => ({
      "اسم المادة": s.name,
      "الفرع الأكاديمي": getAcademicName(s),
      الوصف: s.description || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "قائمة_المواد.xlsx",
    );
  };

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
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
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
