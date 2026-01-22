"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import Breadcrumb from "@/components/common/Breadcrumb";
import SearchableSelect from "@/components/common/SearchableSelect";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

import StudentsTable from "./components/StudentsTable";
import AddStudentModal from "./components/addStudent/AddStudentModal";

// ✅ مودلات التعديل الموجودة عندك
import EditStudentInfoModal from "./components/EditStudentInfoModal";
import EditFamilyModal from "./components/EditFamilyModal";
import EditContactsModal from "./components/EditContactsModal";
import EditAcademicModal from "./components/EditAcademicModal";
import StudentDetailsModal from "./components/StudentDetailsModal";

import { useGetBatchesQuery } from "@/store/services/batchesApi";

// ✅ hooks من studentsApi (مثل ما ثبّتناه)
import {
  useGetStudentsDetailsQuery,
  useLazyGetStudentDetailsByIdQuery,
  useDeleteStudentMutation,
} from "@/store/services/studentsApi";
import StudentsPageSkeleton from "./components/StudentsPageSkeleton";
import AddStudentToBatchModal from "./components/AddStudentToBatchModal";

/* ================= helpers ================= */
function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function splitFullName(fullName) {
  const t = String(fullName || "").trim();
  if (!t) return { first_name: "", last_name: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

function normalizeStudentsDetailsResponse(res) {
  // يدعم شكلين:
  // 1) { status, message, data: [...] }
  // 2) [...] مباشرة
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function normalizeStudentDetailsResponse(res) {
  // يدعم شكلين:
  // 1) { status, message, data: {...} }
  // 2) {...} مباشرة
  if (!res) return null;
  if (res?.data && typeof res.data === "object") return res.data;
  if (typeof res === "object") return res;
  return null;
}

/* ================= component ================= */
export default function StudentsPage() {
  /* ================= API (list) ================= */
  const {
    data: studentsDetailsRes,
    isLoading: loadingStudents,
    refetch: refetchStudents,
  } = useGetStudentsDetailsQuery();

  const studentsDetails = useMemo(
    () => normalizeStudentsDetailsResponse(studentsDetailsRes),
    [studentsDetailsRes]
  );

  const { data: batchesRes } = useGetBatchesQuery();

  const [deleteStudent, { isLoading: deleting }] = useDeleteStudentMutation();
  const [activeAcademicRecordId, setActiveAcademicRecordId] = useState(null);

  /* ================= API (lazy details for one) ================= */
  const [fetchStudentDetails, { isFetching: loadingOne }] =
    useLazyGetStudentDetailsByIdQuery();

  /* ================= Redux filters ================= */
  const search = useSelector((s) => s.search.values.students || "");
  const branchId = useSelector((s) => s.search.values.branch || "");

  /* ================= Local state ================= */
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // add student modal
  const [isAddOpen, setIsAddOpen] = useState(false);

  // delete
  const [openDelete, setOpenDelete] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // active student (details)
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);

  // modals open
  const [openDetails, setOpenDetails] = useState(false);
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [openFamily, setOpenFamily] = useState(false);
  const [openContacts, setOpenContacts] = useState(false);
  const [openAcademic, setOpenAcademic] = useState(false);
  const [openPayments, setOpenPayments] = useState(false);
  const [openAddToBatch, setOpenAddToBatch] = useState(false);
  const onAddToBatch = async (row) => {
    closeAllModals();
    setOpenAddToBatch(true);
    await ensureStudentDetails(row);
  };

  /* ================= Prepare rows for StudentsTable =================
     StudentsTable يعتمد first_name/last_name + institute_branch + batch
  */
  const tableStudents = useMemo(() => {
    return (Array.isArray(studentsDetails) ? studentsDetails : []).map((s) => {
      const { first_name, last_name } = splitFullName(s.full_name);
      return {
        ...s,
        first_name: s.first_name ?? first_name,
        last_name: s.last_name ?? last_name,
        institute_branch_id: s.institute_branch?.id ?? s.institute_branch_id,
        batch_id: s.batch?.id ?? s.batch_id,
      };
    });
  }, [studentsDetails]);

  /* ================= Filtering ================= */
  const filteredStudents = useMemo(() => {
    return (tableStudents || []).filter((s) => {
      const full = String(s.full_name || `${s.first_name} ${s.last_name}`)
        .toLowerCase()
        .trim();

      const matchSearch = full.includes(String(search || "").toLowerCase());
      const matchBatch =
        !selectedBatchId ||
        String(s.batch_id ?? s.batch?.id) === String(selectedBatchId);
      const matchBranch =
        !branchId || String(s.institute_branch_id) === String(branchId);

      return matchSearch && matchBatch && matchBranch;
    });
  }, [tableStudents, search, selectedBatchId, branchId]);

  /* ================= Selection ================= */
  const isAllSelected =
    filteredStudents.length > 0 &&
    selectedIds.length === filteredStudents.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [search, selectedBatchId, branchId]);

  /* ================= helpers: open modal with ensured details ================= */
  const ensureStudentDetails = async (row) => {
    const id = row?.id;
    if (!id) return null;

    setActiveStudentId(id);

    // إذا نفس الطالب محمّل من قبل → لا تعيد طلب
    if (activeStudent && String(activeStudent.id) === String(id)) {
      return activeStudent;
    }

    try {
      const res = await fetchStudentDetails(id).unwrap();
      const details = normalizeStudentDetailsResponse(res);

      if (!details) return null;

      // تأكيد وجود first_name/last_name للـ EditStudentInfoModal
      const { first_name, last_name } = splitFullName(details.full_name);
      const normalized = {
        ...details,
        first_name: details.first_name ?? first_name,
        last_name: details.last_name ?? last_name,
        institute_branch_id:
          details.institute_branch?.id ?? details.institute_branch_id,
        branch_id: details.branch?.id ?? details.branch_id,
        city_id: details.city?.id ?? details.city_id,
        status_id: details.status?.id ?? details.status_id,
        bus_id: details.bus?.id ?? details.bus_id,
      };

      setActiveStudent(normalized);
      return normalized;
    } catch (e) {
      toast.error(e?.data?.message || "فشل جلب تفاصيل الطالب");
      return null;
    }
  };

  const closeAllModals = () => {
    setOpenDetails(false);
    setOpenEditInfo(false);
    setOpenFamily(false);
    setOpenContacts(false);
    setOpenAcademic(false);
    setOpenPayments(false);
  };

  const activeOrRowFallback = (row) => {
    // إذا activeStudent هو نفسه الطالب المطلوب استخدمه، وإلا استخدم row
    if (activeStudent && String(activeStudent?.id) === String(row?.id)) {
      return activeStudent;
    }
    // row غالباً ناقص، بس منرجّعه لحتى ما ينكسر UI
    return row;
  };

  /* ================= Actions ================= */
  const handleAdd = () => {
    setIsAddOpen(true);
  };

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteStudent(studentToDelete.id).unwrap();
      toast.success("تم حذف الطالب بنجاح");
      setSelectedIds((prev) =>
        prev.filter((id) => id !== String(studentToDelete.id))
      );
      setOpenDelete(false);
      setStudentToDelete(null);
    } catch (e) {
      toast.error(e?.data?.message || "فشل حذف الطالب");
    }
  };

  /* ================= Menu callbacks ================= */
  const onViewDetails = async (row) => {
    closeAllModals();
    setOpenDetails(true);
    await ensureStudentDetails(row);
  };

  const onEditInfo = async (row) => {
    closeAllModals();
    setOpenEditInfo(true);
    await ensureStudentDetails(row);
  };

  const onEditFamily = async (row) => {
    closeAllModals();
    setOpenFamily(true);
    await ensureStudentDetails(row);
  };

  const onEditContacts = async (row) => {
    closeAllModals();
    setOpenContacts(true);
    await ensureStudentDetails(row);
  };

  const onEditAcademic = async (row) => {
    closeAllModals();

    const student = await ensureStudentDetails(row);
    if (!student) {
      toast.error("فشل جلب بيانات الطالب");
      return;
    }

    const record = student.academic_records?.[0];
    if (!record?.id) {
      toast.error("لا يوجد سجل أكاديمي لهذا الطالب");
      return;
    }

    setActiveAcademicRecordId(record.id);
    setOpenAcademic(true);
  };

  const onEditPayments = async (row) => {
    closeAllModals();
    setOpenPayments(true);
    await ensureStudentDetails(row);
  };

  /* ================= Print ================= */
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد طالب واحد على الأقل");
      return;
    }

    const rows = filteredStudents.filter((s) =>
      selectedIds.includes(String(s.id))
    );

    const html = `
      <html dir="rtl">
        <head>
          <style>
            body{font-family:Arial;padding:20px}
            table{width:100%;border-collapse:collapse;font-size:12px}
            th,td{border:1px solid #ccc;padding:6px;text-align:right}
            th{background:#fbeaf3}
          </style>
        </head>
        <body>
          <h3>قائمة الطلاب</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الاسم الكامل</th>
                <th>الجنس</th>
                <th>فرع المعهد</th>
                <th>الشعبة</th>
                <th>تاريخ الولادة</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (s, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${esc(
                    s.full_name ?? `${s.first_name} ${s.last_name}`
                  )}</td>
                  <td>${esc(s.gender)}</td>
                  <td>${esc(s.institute_branch?.name)}</td>
                  <td>${esc(s.batch?.name)}</td>
                  <td>${esc(s.date_of_birth)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const w = window.open("", "", "width=900,height=700");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  /* ================= Excel ================= */
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد طالب واحد على الأقل");
      return;
    }

    const rows = filteredStudents
      .filter((s) => selectedIds.includes(String(s.id)))
      .map((s) => ({
        "الاسم الكامل": s.full_name ?? `${s.first_name} ${s.last_name}`,
        الجنس: s.gender,
        "فرع المعهد": s.institute_branch?.name,
        الشعبة: s.batch?.name,
        "تاريخ الولادة": s.date_of_birth,
        "تاريخ التسجيل": s.enrollment_date,
        "بداية الحضور": s.start_attendance_date,
        "الحالة الصحية": s.health_status,
        "الحالة النفسية": s.psychological_status,
        ملاحظات: s.notes,
      }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StudentsDetails");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      "students_details.xlsx"
    );
  };

  /* ================= Render ================= */
  return loadingStudents ? (
    <StudentsPageSkeleton />
  ) : (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">قائمة الطلاب</h1>
          <Breadcrumb />
        </div>
        <div>
          {/* LEFT SIDE — Filter + Print + Excel */}
          <div className="flex flex-col items-end gap-3">
            <div className="w-[240px]">
              <SearchableSelect
                label="الشعبة"
                value={selectedBatchId}
                onChange={setSelectedBatchId}
                placeholder="كل الشعب"
                options={[
                  { key: "all", value: "", label: "كل الشعب" },
                  ...(batchesRes?.data || []).map((b) => ({
                    key: b.id,
                    value: String(b.id),
                    label: b.name,
                  })),
                ]}
              />
            </div>

            <div className="flex gap-2">
              <PrintButton onClick={handlePrint} />
              <ExcelButton onClick={handleExcel} />
            </div>
          </div>
        </div>
      </div>
      {/* FILTER + ACTIONS */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        {/* RIGHT SIDE — Actions */}
        <div className="flex items-center gap-3">
          <ActionsRow
            showSelectAll
            viewLabel=""
            isAllSelected={isAllSelected}
            onToggleSelectAll={() =>
              setSelectedIds(
                isAllSelected ? [] : filteredStudents.map((s) => String(s.id))
              )
            }
            addLabel="إضافة طالب"
            onAdd={handleAdd}
          />
        </div>
      </div>

      {/* TABLE */}
      <StudentsTable
        students={filteredStudents}
        isLoading={loadingStudents}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onViewDetails={onViewDetails}
        onEditStudentInfo={onEditInfo}
        onEditFamily={onEditFamily}
        onEditAcademic={onEditAcademic}
        onEditContacts={onEditContacts}
        onAddToBatch={onAddToBatch}
      />

      {/* ============ DETAILS MODAL ============ */}
      <StudentDetailsModal
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        student={activeStudentId ? activeStudent : null}
        loading={loadingOne}
      />

      {/* ============ EDIT INFO (2 steps only) ============ */}
      <EditStudentInfoModal
        isOpen={openEditInfo}
        onClose={() => setOpenEditInfo(false)}
        student={activeStudentId ? activeStudent : null}
      />

      {/* ============ FAMILY ============ */}
      <EditFamilyModal
        open={openFamily}
        onClose={() => setOpenFamily(false)}
        student={activeStudentId ? activeStudent : null}
        onSaved={async () => {
          if (!activeStudentId) return;
          const res = await fetchStudentDetails(activeStudentId).unwrap();
          const details = normalizeStudentDetailsResponse(res);
          if (details) setActiveStudent(details);
        }}
      />

      {/* ============ CONTACTS ============ */}
      <EditContactsModal
        open={openContacts}
        onClose={() => setOpenContacts(false)}
        student={activeOrRowFallback({ id: activeStudentId })}
        onSaved={() => {
          if (activeStudentId) fetchStudentDetails(activeStudentId);
        }}
      />

      {/* ============ ACADEMIC ============ */}
      <EditAcademicModal
        open={openAcademic}
        recordId={activeAcademicRecordId}
        onClose={() => setOpenAcademic(false)}
        onSaved={async () => {
          if (!activeStudentId) return;
          const res = await fetchStudentDetails(activeStudentId).unwrap();
          const details = normalizeStudentDetailsResponse(res);
          if (details) setActiveStudent(details);
        }}
      />

      {/* ============ PAYMENTS ============ */}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        isOpen={openDelete}
        loading={deleting}
        title="حذف طالب"
        description={`هل أنت متأكد من حذف ${
          studentToDelete?.first_name ?? ""
        } ${studentToDelete?.last_name ?? ""}؟`}
        onClose={() => setOpenDelete(false)}
        onConfirm={confirmDelete}
      />

      {/* ADD STUDENT MODAL (كما هو عندك) */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        student={null}
        onAdded={() => {
          refetchStudents();
          setIsAddOpen(false);
        }}
      />
      <AddStudentToBatchModal
        open={openAddToBatch}
        onClose={() => setOpenAddToBatch(false)}
        student={activeStudent}
        onUpdated={async () => {
          await refetchStudents(); // 🔥 تحديث الجدول
          if (activeStudentId) {
            const res = await fetchStudentDetails(activeStudentId).unwrap();
            setActiveStudent(res.data ?? res);
          }
        }}
      />
    </div>
  );
}
