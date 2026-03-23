"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";

import ActionsRow from "@/components/common/ActionsRow";

import Breadcrumb from "@/components/common/Breadcrumb";

import TeachersTable from "./components/TeachersTable";
import CoursesTable from "./components/CoursesTable";

import AddTeacherModal from "./components/steps/AddTeacherModal";
import EditTeacherModal from "./components/EditTeacherModal";
import EditTeacherPhotoModal from "./components/EditTeacherPhotoModal";
import EditTeacherSubjectsModal from "./components/EditTeacherSubjectsModal";
import EditTeacherBatchesModal from "./components/EditTeacherBatchesModal";

import DeleteConfirmModal from "@/components/common/DeleteConfirmModal"; // ✅ ضفتها

import "@/app/globals.css"; // للتأكد من تطبيق أنماط الطباعة
import {
  useGetTeachersQuery,
  useLazyGetTeacherBatchesDetailsQuery,
  useDeleteTeacherMutation, // ✅ ضفتها
} from "@/store/services/teachersApi";

import { useGetSubjectsQuery } from "@/store/services/subjectsApi";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

export default function TeachersPage({ openAddFromUrl }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  // ===== API =====
  const { data, isLoading } = useGetTeachersQuery();
  const teachers = data?.data || [];

  const { data: subjectsData } = useGetSubjectsQuery();
  const subjects = subjectsData || [];

  // ✅ Delete mutation
  const [deleteTeacher, { isLoading: deleting }] = useDeleteTeacherMutation();

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
  const [printData, setPrintData] = useState([]); // [{ teacher, batches }]
  const [printing, setPrinting] = useState(false);
  const isAllSelected =
    filteredTeachers.length > 0 &&
    selectedIds.length === filteredTeachers.length;

  const toggleSelectAll = () => {
    setSelectedIds(
      isAllSelected ? [] : filteredTeachers.map((t) => String(t.id)),
    );
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

  // ✅ Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

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

  // ✅ فتح مودال الحذف (هاي اللي TeachersTable بتناديها)
  const handleAskDelete = (t) => {
    setTeacherToDelete(t);
    setDeleteOpen(true);
    setOpenMenuId(null);
  };

  // ✅ تنفيذ الحذف بعد التأكيد
  const handleConfirmDelete = async () => {
    if (!teacherToDelete?.id) return;

    try {
      await deleteTeacher(teacherToDelete.id).unwrap();
      notify.success("تم حذف المدرس بنجاح");

      setSelectedIds((prev) =>
        prev.filter((id) => id !== String(teacherToDelete.id)),
      );
      setDeleteOpen(false);
      setTeacherToDelete(null);
    } catch (err) {
      const errors = err?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey]?.[0];
        if (firstMsg) return notify.error(firstMsg);
      }
      notify.error(err?.data?.message || "فشل حذف المدرس");
    }
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setTeacherToDelete(null);
  };

  if (isLoading) {
    const tableHeaders = [
      "#",
      "الاسم",
      "الفرع",
      "الاختصاص",
      "الهاتف",
      "تاريخ التعيين",
      "الإجراءات",
    ];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col text-right">
          <h1 className="text-lg font-semibold text-gray-700">المدرسون</h1>
          <Breadcrumb />
        </div>
      </div>

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
          <PrintExportActions
            data={filteredTeachers}
            selectedIds={selectedIds}
            columns={[
              { header: "الاسم", key: "name" },
              {
                header: "الفرع",
                key: "institute_branch",
                render: (val) => val?.name ?? "-",
              },
              { header: "الاختصاص", key: "specialization" },
              { header: "الهاتف", key: "phone" },
              { header: "تاريخ التعيين", key: "hire_date" },
            ]}
            title="قائمة المدرسين"
            filename="المدرسين"
          />
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
          onDelete={handleAskDelete} // ✅ هون المهم
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

      {/* ✅ Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="حذف مدرس"
        description={`هل تريد بالتأكيد حذف المدرس "${teacherToDelete?.name || ""}" ؟`}
        confirmText="حذف"
        cancelText="إلغاء"
      />

      {/* ===== PRINT ONLY ===== */}
      <div id="print-root" className="print-only">
        {printData.map(({ teacher, batches }) => (
          <div key={teacher?.id} className="print-page">
            <h2 className="print-title">بيانات الأستاذ</h2>

            <div className="print-card">
              <div>الاسم: {teacher?.name || "—"}</div>
              <div>الفرع: {teacher?.institute_branch?.name || "—"}</div>
              <div>الاختصاص: {teacher?.specialization || "—"}</div>
              <div dir="ltr">الهاتف: {teacher?.phone || "—"}</div>
              <div>تاريخ التعيين: {teacher?.hire_date || "—"}</div>
            </div>

            <h3 className="print-subtitle">الشعب والمواد</h3>

            {Array.isArray(batches) && batches.length > 0 ? (
              <table className="print-table">
                <thead>
                  <tr>
                    <th>الشعبة</th>
                    <th>القاعة</th>
                    <th>الفترة</th>
                    <th>المواد</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b, i) => {
                    const subjectsText =
                      b?.subjects?.length > 0
                        ? b.subjects.map((s) => s.subject_name).join("، ")
                        : "—";

                    return (
                      <tr key={`${teacher?.id}-${b?.batch_id}-${i}`}>
                        <td>{b?.batch_name || b?.name || "—"}</td>
                        <td>{b?.class_room?.name || "—"}</td>
                        <td>
                          {(b?.start_date || "—") +
                            " → " +
                            (b?.end_date || "—")}
                        </td>
                        <td>{subjectsText}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="print-empty">
                لا يوجد بيانات دورات/شعب لهذا الأستاذ
              </div>
            )}

            <div className="print-break" />
          </div>
        ))}
      </div>
    </div>
  );
}
