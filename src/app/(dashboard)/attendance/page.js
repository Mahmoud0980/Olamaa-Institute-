"use client";

import { useEffect, useMemo, useState } from "react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDispatch, useSelector } from "react-redux";
import { clearSearchValue, setSearchValue } from "@/store/slices/searchSlice";
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
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SearchableSelect from "@/components/common/SearchableSelect";

import AttendanceTable from "./components/AttendanceTable";
import StudentSidePanel from "./components/StudentSidePanel";
import SelectedStudentAttendanceTable from "./components/SelectedStudentAttendanceTable";
import AddAttendanceModal from "./components/AddAttendanceModal";

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
  s === "present"
    ? "موجود"
    : s === "late"
    ? "متأخر"
    : s === "absent"
    ? "غائب"
    : s === "excused"
    ? "إذن"
    : s || "-";

function formatTime(val) {
  if (!val) return "-";
  const t = String(val).split(" ")[1] || "";
  if (!t) return "-";
  const [hh, mm] = t.split(":");
  return hh && mm ? `${hh}:${mm}` : t;
}

/* ================= Page ================= */
export default function AttendancePage() {
  const dispatch = useDispatch();

  // ✅ من Navbar
  const branchId = useSelector((state) => state.search.values.branch);
  const navSearch = useSelector(
    (state) => state.search.values.attendance ?? ""
  ); // لازم تضيف attendance بالـ searchSlice

  // ===== Data =====
  const {
    data: attendanceRes,
    isLoading,
    isFetching,
  } = useGetAttendanceQuery();

  const attendanceAll = attendanceRes?.data || [];

  const { data: batchesRes } = useGetBatchesQuery();
  const batches = batchesRes?.data || [];

  // فقط للماب (اسم الفرع)
  const { data: branchesRes } = useGetInstituteBranchesQuery();
  const branches = branchesRes?.data || [];

  // studentsApi عندك بيرجع Array مباشرة
  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const allStudents = studentsRes?.data || [];

  // ===== Maps =====
  const studentsById = useMemo(() => {
    const m = {};
    (allStudents || []).forEach((s) => {
      m[s.id] = { ...s, full_name: studentFullName(s) };
    });
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

  // ===== Delete =====
  const [deleteAttendance, { isLoading: isDeleting }] =
    useDeleteAttendanceMutation();

  // ===== Filters (بدون فلتر حالة) =====
  const [filters, setFilters] = useState({
    batchId: "",
    studentId: "",
  });

  // ===== Calendar range =====
  const [attendanceRange, setAttendanceRange] = useState({
    start: null,
    end: null,
  });
  const [selectedDate, setSelectedDate] = useState(null);

  // ===== Row-click details table =====
  const [detailsStudentId, setDetailsStudentId] = useState("");

  // ✅ (التعديل) هل جدول التفاصيل مفتوح؟
  const isDetailsOpen = !filters.studentId && !!detailsStudentId;

  // الطالب للكارد يسار: يا من فلتر الاسم يا من ضغط سطر
  const sideStudentId = filters.studentId || detailsStudentId;

  const sideStudent = useMemo(() => {
    if (!sideStudentId) return null;
    return studentsById[Number(sideStudentId)] || null;
  }, [sideStudentId, studentsById]);

  // ===== Select options =====
  const batchesOptions = useMemo(() => {
    return (batches || []).map((b) => ({
      value: String(b.id),
      label: b.name,
    }));
  }, [batches]);

  const studentsOptions = useMemo(() => {
    return (allStudents || [])
      .map((s) => {
        const label = studentFullName(s);
        if (!label) return null;
        return { value: String(s.id), label };
      })
      .filter(Boolean);
  }, [allStudents]);

  // ===== Filtered records (table) =====
  const filtered = useMemo(() => {
    const bId = filters.batchId ? Number(filters.batchId) : null;
    const sId = filters.studentId ? Number(filters.studentId) : null;

    const brId = branchId ? Number(branchId) : null;
    const q = (navSearch || "").trim().toLowerCase();

    return attendanceAll.filter((r) => {
      const matchBatch = !bId || r.batch_id === bId;
      const matchStudent = !sId || r.student_id === sId;

      // ✅ فرع السجل: يا من attendance نفسه يا من batch
      const batch = batchesById?.[r.batch_id];
      const recBranchId =
        r.institute_branch_id || batch?.institute_branch?.id || null;

      const matchBranch = !brId || Number(recBranchId) === brId;

      // ✅ بحث Navbar (اسم الطالب)
      const st = studentsById?.[r.student_id];
      const name = (st?.full_name || "").toLowerCase();
      const matchSearch = !q || name.includes(q);

      // ✅ فلترة التاريخ (range)
      const ymd = r.attendance_date || "";
      const matchDate = ymd
        ? inRange(ymd, attendanceRange.start, attendanceRange.end)
        : true;

      return (
        matchBatch && matchStudent && matchBranch && matchSearch && matchDate
      );
    });
  }, [
    attendanceAll,
    filters.batchId,
    filters.studentId,
    attendanceRange.start,
    attendanceRange.end,
    branchId,
    navSearch,
    studentsById,
    batchesById,
  ]);
  // ✅ آخر سجل لكل طالب (بعد الفلاتر)
  const latestPerStudent = useMemo(() => {
    const map = new Map(); // key: student_id, value: latest record

    for (const r of filtered) {
      const key = r.student_id;
      const prev = map.get(key);

      // قارن بالتاريخ + recorded_at إذا موجود
      const prevKey = `${prev?.attendance_date || ""} ${
        prev?.recorded_at || ""
      }`;
      const currKey = `${r.attendance_date || ""} ${r.recorded_at || ""}`;

      if (!prev || currKey > prevKey) {
        map.set(key, r);
      }
    }

    // ترتيب تنازلي حسب التاريخ/الوقت
    return Array.from(map.values()).sort((a, b) => {
      const ak = `${a.attendance_date || ""} ${a.recorded_at || ""}`;
      const bk = `${b.attendance_date || ""} ${b.recorded_at || ""}`;
      return ak > bk ? -1 : 1;
    });
  }, [filtered]);

  // ===== Reset all filters (زر عرض كل البيانات) =====
  const resetAll = () => {
    setFilters({ batchId: "", studentId: "" });
    setAttendanceRange({ start: null, end: null });
    setSelectedDate(null);
    setDetailsStudentId("");
    setSelectedIds([]);

    // ✅ يمسح بحث Navbar الخاص بصفحة الحضور
    dispatch(clearSearchValue("attendance"));

    // إذا بدك كمان يرجّع الفرع "كل الفروع" فعّل:
    // dispatch(setSearchValue({ key: "branch", value: "" }));
  };

  // ===== Details records (جدول الطالب) =====
  const detailsRecords = useMemo(() => {
    if (!detailsStudentId) return [];
    const sid = Number(detailsStudentId);
    const bId = filters.batchId ? Number(filters.batchId) : null;

    return attendanceAll
      .filter((r) => {
        const matchStudent = r.student_id === sid;
        const matchBatch = !bId || r.batch_id === bId;

        const ymd = r.attendance_date || "";
        const matchDate = ymd
          ? inRange(ymd, attendanceRange.start, attendanceRange.end)
          : true;

        return matchStudent && matchBatch && matchDate;
      })
      .sort((a, b) => (a.attendance_date > b.attendance_date ? -1 : 1));
  }, [
    detailsStudentId,
    attendanceAll,
    filters.batchId,
    attendanceRange.start,
    attendanceRange.end,
  ]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const tableRecords = isDetailsOpen ? detailsRecords : latestPerStudent;

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === tableRecords.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : tableRecords.map((x) => x.id));
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [
    filters.batchId,
    filters.studentId,
    attendanceRange.start,
    attendanceRange.end,
    branchId,
    navSearch,
  ]);

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const openAdd = () => {
    setEditRecord(null);
    setIsModalOpen(true);
  };

  const openEdit = (rec) => {
    setEditRecord(rec);
    setIsModalOpen(true);
  };

  const openDelete = (rec) => {
    setRecordToDelete(rec);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteAttendance({
        id: recordToDelete.id,
        batchId: recordToDelete.batch_id,
      }).unwrap();

      notify.success("تم حذف السجل بنجاح");
      setIsDeleteOpen(false);
      setRecordToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل حذف السجل");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (!selectedIds.length)
      return notify.error("يرجى تحديد سجل واحد على الأقل");

    const rows = tableRecords.filter((r) => selectedIds.includes(r.id));

    const html = `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
            th { background: #f3f3f3; }
          </style>
        </head>
        <body>
          <h3>سجلات الحضور والغياب</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>الطالب</th>
                <th>الفرع</th>
                <th>الشعبة</th>
                <th>التاريخ</th>
                <th>التفقد</th>
                <th>وقت الوصول</th>
                <th>وقت الانصراف</th>
              </tr>
            </thead>
            <tbody>
              ${rows
                .map((r, i) => {
                  const st = studentsById?.[r.student_id];
                  const studentName = st?.full_name || "-";

                  const batch = batchesById?.[r.batch_id];
                  const batchName = batch?.name || "-";

                  const branch =
                    branchesById?.[r.institute_branch_id] ||
                    batch?.institute_branch ||
                    null;
                  const branchName = branch?.name || "-";

                  return `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${studentName}</td>
                      <td>${branchName}</td>
                      <td>${batchName}</td>
                      <td>${r.attendance_date || "-"}</td>
                      <td>${statusLabel(r.status)}</td>
                      <td>${formatTime(r.recorded_at)}</td>
                      <td>${formatTime(
                        r.exit_at || r.exit_time || r.departure_time
                      )}</td>
                    </tr>
                  `;
                })
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

  // ===== Excel =====
  const handleExcel = () => {
    if (!selectedIds.length)
      return notify.error("يرجى تحديد سجل واحد على الأقل");

    const rows = tableRecords.filter((r) => selectedIds.includes(r.id));

    const excelRows = rows.map((r) => {
      const st = studentsById?.[r.student_id];
      const studentName = st?.full_name || "-";

      const batch = batchesById?.[r.batch_id];
      const batchName = batch?.name || "-";

      const branch =
        branchesById?.[r.institute_branch_id] || batch?.institute_branch;
      const branchName = branch?.name || "-";

      return {
        الطالب: studentName,
        الفرع: branchName,
        الشعبة: batchName,
        التاريخ: r.attendance_date || "-",
        التفقد: statusLabel(r.status),
        "وقت الوصول": formatTime(r.recorded_at),
        "وقت الانصراف": formatTime(
          r.exit_at || r.exit_time || r.departure_time
        ),
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "سجلات_الحضور_والغياب.xlsx"
    );
  };

  // ===== row click -> show details (بدون ما يشتغل إذا فلتر طالب شغال) =====
  const handleRowClick = (rec) => {
    if (filters.studentId) return;
    const sid = String(rec.student_id || "");
    setDetailsStudentId((prev) => (prev === sid ? "" : sid));
  };

  return (
    <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
      {/* ===== Header: filters right + titles left (نفس الصف) ===== */}
      <div className="flex flex-col lg:flex-row-reverse items-start justify-between gap-4">
        {/* Filters (يمين) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="sm:min-w-[240px] ">
            <SearchableSelect
              label="الدورة"
              value={filters.batchId}
              onChange={(v) => {
                setFilters((p) => ({ ...p, batchId: v, studentId: "" }));
                setDetailsStudentId("");
              }}
              options={batchesOptions}
              placeholder="اكتب للبحث..."
            />
          </div>

          <div className="sm:min-w-[260px]">
            <SearchableSelect
              label="اسم الطالب"
              value={filters.studentId}
              onChange={(v) => {
                setFilters((p) => ({ ...p, studentId: v }));
                setDetailsStudentId("");
              }}
              options={studentsOptions}
              placeholder="اكتب اسم الطالب..."
            />
          </div>
        </div>

        {/* Titles (يسار) */}
        <div className="text-right w-full lg:w-auto">
          <h1 className="text-lg font-semibold text-gray-700">
            حالة الغياب والحضور
          </h1>
          <Breadcrumb />
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Actions يمين */}
        <ActionsRow
          addLabel="إضافة سجل"
          viewLabel=""
          showSelectAll
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={openAdd}
          showViewAll
          onViewAll={resetAll}
          viewAllLabel="عرض كل البيانات"
        />

        {/* Print/Excel يسار */}
        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      {/* ===== Layout: table RIGHT + side panel LEFT (ما بيدخل ببعضه) ===== */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* RIGHT: Table area */}
        <section className="flex-1 min-w-0 lg:order-1">
          {/* ✅ (التعديل) يا تفاصيل يا جدول رئيسي */}
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
              onEdit={openEdit}
              onDelete={openDelete}
              onRowClick={handleRowClick}
              studentsById={studentsById}
              batchesById={batchesById}
              branchesById={branchesById}
            />
          )}
        </section>

        {/* LEFT: Student panel أصغر + sticky */}
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

      {/* Add/Edit modal */}
      <AddAttendanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={editRecord}
      />

      {/* Delete confirm */}
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
