"use client";

import { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { clearSearchValue } from "@/store/slices/searchSlice";
import { notify } from "@/lib/helpers/toastify";
// ===== APIs =====
import {
  useGetAttendanceQuery,
  useDeleteAttendanceMutation,
} from "@/store/services/attendanceApi";
import { useGetStudentsDetailsQuery } from "@/store/services/studentsApi";
import { useGetBatchesQuery } from "@/store/services/batchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

// ===== Components =====
import Breadcrumb from "@/components/common/Breadcrumb";
import ActionsRow from "@/components/common/ActionsRow";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchableSelect from "@/components/common/SearchableSelect";
import PrintExportActions from "@/components/common/PrintExportActions";

import AttendanceTable from "./components/AttendanceTable";
import StudentSidePanel from "./components/StudentSidePanel";
import SelectedStudentAttendanceTable from "./components/SelectedStudentAttendanceTable";
import AddAttendanceModal from "./components/AddAttendanceModal";
import PageSkeleton from "@/components/common/PageSkeleton";

/* ================= Helpers ================= */
function studentFullName(s) {
  if (!s) return "";
  if (s.full_name) return s.full_name;
  const first = s.first_name || s.name || "";
  const last = s.last_name || s.family_name || s.surname || "";
  return `${first} ${last}`.trim();
}

function toYMD(d) {
  return d instanceof Date ? d.toLocaleDateString("en-CA") : "";
}

function normalizeRange(start, end) {
  const a = toYMD(start);
  const b = toYMD(end);
  if (!a || !b) return { min: "", max: "" };
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

function inRange(ymd, start, end) {
  if (!start && !end) return true;
  if (start && !end) return ymd === toYMD(start);
  const { min, max } = normalizeRange(start, end);
  return ymd >= min && ymd <= max;
}

const statusLabel = (s) =>
  s === "present" ? "موجود" :
  s === "late" ? "متأخر" :
  s === "absent" ? "غائب" :
  s === "excused" ? "إذن" : s || "-";

function formatTime(val) {
  if (!val) return "-";
  const t = String(val).split(" ")[1] || "";
  if (!t) return "-";
  const [hh, mm] = t.split(":");
  return hh && mm ? `${hh}:${mm}` : t;
}

function normalizeArray(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && typeof res.data === "object") {
    const list = res.data.batches || res.data.students || res.data.employees || res.data.data || [];
    if (Array.isArray(list)) return list;
  }
  return [];
}

/* ================= Page ================= */
export default function AttendancePage() {
  const dispatch = useDispatch();

  const branchId = useSelector((state) => state.search.values.branch);
  const navSearch = useSelector((state) => state.search.values.attendance ?? "");

  const { data: attendanceRes, isLoading, isFetching } = useGetAttendanceQuery();
  const attendanceAll = normalizeArray(attendanceRes);

  const { data: batchesRes } = useGetBatchesQuery();
  const batches = normalizeArray(batchesRes);

  const { data: branchesRes } = useGetInstituteBranchesQuery();
  const branches = normalizeArray(branchesRes);

  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const allStudents = normalizeArray(studentsRes);

  const studentsById = useMemo(() => {
    const m = {};
    (allStudents || []).forEach((s) => { m[s.id] = { ...s, full_name: studentFullName(s) }; });
    return m;
  }, [allStudents]);

  const batchesById = useMemo(() => {
    const m = {};
    (batches || []).forEach((b) => (m[b.id] = b));
    return m;
  }, [batches]);

  const branchesById = useMemo(() => {
    const m = {};
    (branches || []).forEach((b) => (m[b.id] = b));
    return m;
  }, [branches]);

  const [deleteAttendance, { isLoading: isDeleting }] = useDeleteAttendanceMutation();

  const [filters, setFilters] = useState({ batchId: "", studentId: "" });
  const [attendanceRange, setAttendanceRange] = useState({ start: null, end: null });
  const [selectedDate, setSelectedDate] = useState(null);
  const [detailsStudentId, setDetailsStudentId] = useState("");

  const isDetailsOpen = !filters.studentId && !!detailsStudentId;
  const sideStudentId = filters.studentId || detailsStudentId;

  const sideStudent = useMemo(() => {
    if (!sideStudentId) return null;
    return studentsById[Number(sideStudentId)] || null;
  }, [sideStudentId, studentsById]);

  const batchesOptions = useMemo(() => (batches || []).map((b) => ({ value: String(b.id), label: b.name })), [batches]);
  const studentsOptions = useMemo(() => (allStudents || []).map((s) => ({ value: String(s.id), label: studentFullName(s) })).filter(x => x.label), [allStudents]);

  const filtered = useMemo(() => {
    const bId = filters.batchId ? Number(filters.batchId) : null;
    const sId = filters.studentId ? Number(filters.studentId) : null;
    const brId = branchId ? Number(branchId) : null;
    const q = (navSearch || "").trim().toLowerCase();

    return attendanceAll.filter((r) => {
      const matchBatch = !bId || r.batch_id === bId;
      const matchStudent = !sId || r.student_id === sId;
      const batch = batchesById?.[r.batch_id];
      const recBranchId = r.institute_branch_id || batch?.institute_branch?.id || null;
      const matchBranch = !brId || Number(recBranchId) === brId;
      const st = studentsById?.[r.student_id];
      const name = (st?.full_name || "").toLowerCase();
      const matchSearch = !q || name.includes(q);
      const ymd = r.attendance_date || "";
      const matchDate = ymd ? inRange(ymd, attendanceRange.start, attendanceRange.end) : true;
      return matchBatch && matchStudent && matchBranch && matchSearch && matchDate;
    });
  }, [attendanceAll, filters.batchId, filters.studentId, attendanceRange, branchId, navSearch, studentsById, batchesById]);

  const latestPerStudent = useMemo(() => {
    const map = new Map();
    for (const r of filtered) {
      const key = r.student_id;
      const prev = map.get(key);
      const prevKey = `${prev?.attendance_date || ""} ${prev?.recorded_at || ""}`;
      const currKey = `${r.attendance_date || ""} ${r.recorded_at || ""}`;
      if (!prev || currKey > prevKey) map.set(key, r);
    }
    return Array.from(map.values()).sort((a, b) => {
      const ak = `${a.attendance_date || ""} ${a.recorded_at || ""}`;
      const bk = `${b.attendance_date || ""} ${b.recorded_at || ""}`;
      return ak > bk ? -1 : 1;
    });
  }, [filtered]);

  const resetAll = () => {
    setFilters({ batchId: "", studentId: "" });
    setAttendanceRange({ start: null, end: null });
    setSelectedDate(null);
    setDetailsStudentId("");
    setSelectedIds([]);
    dispatch(clearSearchValue("attendance"));
  };

  const detailsRecords = useMemo(() => {
    if (!detailsStudentId) return [];
    const sid = Number(detailsStudentId);
    const bId = filters.batchId ? Number(filters.batchId) : null;
    return attendanceAll.filter((r) => {
      const matchStudent = r.student_id === sid;
      const matchBatch = !bId || r.batch_id === bId;
      const ymd = r.attendance_date || "";
      const matchDate = ymd ? inRange(ymd, attendanceRange.start, attendanceRange.end) : true;
      return matchStudent && matchBatch && matchDate;
    }).sort((a, b) => (a.attendance_date > b.attendance_date ? -1 : 1));
  }, [detailsStudentId, attendanceAll, filters.batchId, attendanceRange]);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filters, attendanceRange, branchId, navSearch, detailsStudentId]);

  const tableRecords = isDetailsOpen ? detailsRecords : latestPerStudent;

  // تنظيف التحديد إذا انحذفت عناصر
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = prev.filter((id) => tableRecords.some((r) => String(r.id) === id));
      if (validIds.length === prev.length) return prev;
      return validIds;
    });
  }, [tableRecords]);

  const isAllSelected = tableRecords.length > 0 && selectedIds.length === tableRecords.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : tableRecords.map((x) => String(x.id)));
  };

  const exportColumns = useMemo(() => [
    { 
      header: "الطالب", 
      key: "student_id",
      render: (sid) => studentsById?.[sid]?.full_name || "-"
    },
    { 
      header: "الفرع", 
      key: "institute_branch_id",
      render: (brid, row) => {
        const batch = batchesById?.[row.batch_id];
        const branch = branchesById?.[brid] || batch?.institute_branch;
        return branch?.name || "-";
      }
    },
    { 
      header: "الشعبة", 
      key: "batch_id",
      render: (bid) => batchesById?.[bid]?.name || "-"
    },
    { header: "التاريخ", key: "attendance_date" },
    { header: "التفقد", key: "status", render: statusLabel },
    { header: "وقت الوصول", key: "recorded_at", render: formatTime },
    { 
      header: "وقت الانصراف", 
      key: "exit_at",
      render: (val, row) => formatTime(val || row.exit_time || row.departure_time)
    },
  ], [studentsById, batchesById, branchesById]);

  /* ================= Modals ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  if (isLoading) {
    const tableHeaders = ["#", "الطالب", "الفرع", "الشعبة", "التاريخ", "التفقد", "وقت الوصول", "وقت الانصراف", "الإجراءات"];
    return <PageSkeleton tableHeaders={tableHeaders} />;
  }

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteAttendance({ id: recordToDelete.id, batchId: recordToDelete.batch_id }).unwrap();
      notify.success("تم حذف السجل بنجاح");
      setIsDeleteOpen(false);
      setRecordToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل حذف السجل");
    }
  };

  const handleRowClick = (rec) => {
    if (filters.studentId) return;
    const sid = String(rec.student_id || "");
    setDetailsStudentId((prev) => (prev === sid ? "" : sid));
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row-reverse items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="sm:min-w-[240px]">
            <SearchableSelect
              label="الدورة"
              value={filters.batchId}
              onChange={(v) => { setFilters((p) => ({ ...p, batchId: v, studentId: "" })); setDetailsStudentId(""); }}
              options={batchesOptions}
            />
          </div>
          <div className="sm:min-w-[260px]">
            <SearchableSelect
              label="اسم الطالب"
              value={filters.studentId}
              onChange={(v) => { setFilters((p) => ({ ...p, studentId: v })); setDetailsStudentId(""); }}
              options={studentsOptions}
            />
          </div>
        </div>
        <div className="text-right w-full lg:w-auto">
          <h1 className="text-lg font-semibold text-gray-700">حالة الغياب والحضور</h1>
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ActionsRow
          addLabel="إضافة سجل"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => { setEditRecord(null); setIsModalOpen(true); }}
          showViewAll
          onViewAll={resetAll}
          viewAllLabel="عرض كل البيانات"
        />
        <div className="flex gap-2">
          <PrintExportActions 
            data={tableRecords}
            selectedIds={selectedIds}
            columns={exportColumns}
            title="حالة الغياب والحضور"
            filename="سجلات_الحضور"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <section className="flex-1 min-w-0 lg:order-1">
          {isDetailsOpen ? (
            <SelectedStudentAttendanceTable
              student={studentsById[Number(detailsStudentId)] || null}
              records={detailsRecords}
              onClose={() => setDetailsStudentId("")}
            />
          ) : (
            <AttendanceTable
              records={latestPerStudent}
              isLoading={isLoading || isFetching}
              selectedIds={selectedIds}
              onSelectChange={setSelectedIds}
              onEdit={(rec) => { setEditRecord(rec); setIsModalOpen(true); }}
              onDelete={(rec) => { setRecordToDelete(rec); setIsDeleteOpen(true); }}
              onRowClick={handleRowClick}
              studentsById={studentsById}
              batchesById={batchesById}
              branchesById={branchesById}
            />
          )}
        </section>
        <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-[96px] lg:order-2">
          <StudentSidePanel
            student={sideStudent}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            attendanceRange={attendanceRange}
            onRangeChange={(payload) => setAttendanceRange(payload.range)}
          />
        </aside>
      </div>

      <AddAttendanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} record={editRecord} />
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={isDeleting}
        title="حذف سجل"
        description={`هل أنت متأكد من حذف السجل رقم ${recordToDelete?.id}؟`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
