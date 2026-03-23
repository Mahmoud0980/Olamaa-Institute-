"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import Breadcrumb from "@/components/common/Breadcrumb";
import ActionsRow from "@/components/common/ActionsRow";
import SearchableSelect from "@/components/common/SearchableSelect";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { notify } from "@/lib/helpers/toastify";
import { useGetBatchesQuery } from "@/store/services/batchesApi";
import { useGetStudentsDetailsQuery } from "@/store/services/studentsApi";

import {
  useGetFilteredExamsQuery,
  useGetStudentExamResultsQuery,
  useAddExamMutation,
  useAddExamResultMutation,
  useGetExamByIdQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetExamResultByIdQuery,
  useUpdateExamResultMutation,
  useDeleteExamResultMutation,
} from "@/store/services/examsApi";

import ExamsTable from "./components/ExamsTable";
import ExamResultsTable from "./components/ExamResultsTable";
import ExamAddModal from "./components/ExamAddModal";
import ExamResultAddModal from "./components/ExamResultAddModal";
import PageSkeleton from "@/components/common/PageSkeleton";
import PrintExportActions from "@/components/common/PrintExportActions";

/* ================= Helpers ================= */
function toId(v) {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

function matchesBatch(row, batchId) {
  if (!batchId) return true;
  const wanted = String(batchId);
  if (toId(row?.batch_id) === wanted) return true;
  if (toId(row?.institute_batch_id) === wanted) return true;
  if (toId(row?.academic_batch_id) === wanted) return true;
  if (toId(row?.batch?.id) === wanted) return true;
  if (Array.isArray(row?.batches)) {
    if (row.batches.some((b) => toId(b?.id) === wanted)) return true;
  }
  if (Array.isArray(row?.batch_ids)) {
    if (row.batch_ids.map(String).includes(wanted)) return true;
  }
  return false;
}

function matchesStudent(row, studentId) {
  if (!studentId) return true;
  const wanted = String(studentId);
  if (toId(row?.student_id) === wanted) return true;
  if (toId(row?.student?.id) === wanted) return true;
  if (Array.isArray(row?.students)) {
    if (row.students.some((s) => toId(s?.id) === wanted)) return true;
  }
  if (Array.isArray(row?.student_ids)) {
    if (row.student_ids.map(String).includes(wanted)) return true;
  }
  if (Array.isArray(row?.results)) {
    if (row.results.some((r) => toId(r?.student_id) === wanted)) return true;
  }
  if (Array.isArray(row?.exam_results)) {
    if (row.exam_results.some((r) => toId(r?.student_id) === wanted))
      return true;
  }
  return false;
}
function normalizeArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

function normalizeResultsItems(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

function normalizeObject(res) {
  if (res?.data && typeof res.data === "object") return res.data;
  if (res && typeof res === "object") return res;
  return null;
}

function buildParams({ studentId, batchId }) {
  const p = {};
  if (studentId) p.student_id = Number(studentId);
  if (batchId) p.batch_id = Number(batchId);
  return p;
}

const getExamId = (row) => row?.id ?? row?.exam_id ?? row?.examId ?? null;

const getResultId = (row) =>
  row?.id ??
  row?.exam_result_id ??
  row?.result_id ??
  row?.student_exam_result_id ??
  row?.student_exam_results_id ??
  row?.examResultId ??
  null;

const isPendingResponse = (res) => {
  const msg = String(res?.message || "");
  return (
    res?.data?.status === "pending" ||
    msg.includes("ينتظر") ||
    msg.includes("موافقة") ||
    msg.includes("قيد") ||
    msg.toLowerCase().includes("pending") ||
    msg.includes("تم إرسال طلب") ||
    msg.includes("طلب")
  );
};

const firstErr = (err) => {
  const errors = err?.data?.errors;
  if (!errors) return null;
  const k = Object.keys(errors)[0];
  return errors?.[k]?.[0] || null;
};

/* ================= Page ================= */

export default function ExamsPage() {
  const [mode, setMode] = useState("exams");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const students = useMemo(() => normalizeArray(studentsRes), [studentsRes]);

  const { data: batchesRes } = useGetBatchesQuery();
  const batches = useMemo(() => normalizeArray(batchesRes), [batchesRes]);
  const search = useSelector((state) => state.search.values.exams);

  const params = useMemo(
    () =>
      buildParams({ studentId: selectedStudentId, batchId: selectedBatchId }),
    [selectedStudentId, selectedBatchId],
  );

  const {
    data: examsRes,
    isLoading: loadingExams,
    isFetching: fetchingExams,
  } = useGetFilteredExamsQuery(params);

  const {
    data: resultsRes,
    isLoading: loadingResults,
    isFetching: fetchingResults,
  } = useGetStudentExamResultsQuery(params, { skip: mode !== "results" });

  const studentsMap = useMemo(() => {
    const m = {};
    students.forEach((s) => (m[String(s.id)] = s));
    return m;
  }, [students]);

  const exams = useMemo(() => normalizeArray(examsRes), [examsRes]);

  const loading =
    mode === "exams"
      ? loadingExams || fetchingExams
      : loadingResults || fetchingResults;

  const rows = useMemo(() => {
    if (mode === "exams") return exams;
    const base = normalizeResultsItems(resultsRes);
    return base.map((r) => {
      const st = studentsMap[String(r?.student_id)];
      const studentName =
        st?.full_name ||
        `${r?.student_first_name ?? ""} ${r?.student_last_name ?? ""}`.trim() ||
        "—";
      return {
        ...r,
        student_name: studentName,
        exam_name: r?.exam_type ?? "—",
        exam_date: r?.exam_date ?? "—",
        subject_name: r?.subject_name ?? "—",
        is_passed: r?.is_passed,
      };
    });
  }, [mode, resultsRes, studentsMap, exams]);

  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (mode === "exams") {
      data = data.filter((r) => {
        const okStudent = matchesStudent(r, selectedStudentId);
        const okBatch = matchesBatch(r, selectedBatchId);
        return okStudent && okBatch;
      });
    }
    if (!search?.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((r) => {
      if (mode === "exams") {
        return (
          String(r?.name ?? "").toLowerCase().includes(q) ||
          String(r?.exam_type ?? "").toLowerCase().includes(q) ||
          String(r?.exam_date ?? "").toLowerCase().includes(q)
        );
      }
      return (
        String(r?.student_name ?? "").toLowerCase().includes(q) ||
        String(r?.subject_name ?? "").toLowerCase().includes(q) ||
        String(r?.exam_name ?? "").toLowerCase().includes(q) ||
        String(r?.is_passed ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, mode, selectedStudentId, selectedBatchId]);

  const [selectedIds, setSelectedIds] = useState([]);
  const isAllSelected =
    filteredRows.length > 0 && selectedIds.length === filteredRows.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [mode, selectedStudentId, selectedBatchId, search]);

  const exportColumns = useMemo(() => {
    if (mode === "exams") {
      return [
        { header: "اسم المذاكرة", key: "name" },
        { header: "التاريخ", key: "exam_date" },
        { header: "نوع الامتحان", key: "exam_type" },
        { header: "الوقت", key: "exam_time", render: (v) => v?.slice(0, 5) ?? "—" },
        { header: "العلامة العظمى", key: "total_marks" },
        { header: "علامة النجاح", key: "passing_marks" },
        { header: "الحالة", key: "status" },
      ];
    } else {
      return [
        { header: "الطالب", key: "student_name" },
        { header: "المادة", key: "subject_name" },
        { header: "نوع الامتحان", key: "exam_name" },
        { header: "التاريخ", key: "exam_date" },
        { header: "العلامة", key: "obtained_marks" },
        { header: "النتيجة", key: "is_passed" },
      ];
    }
  }, [mode]);

  /* ================= ADD ================= */
  const [openAddExam, setOpenAddExam] = useState(false);
  const [openAddResult, setOpenAddResult] = useState(false);
  const [addExam, { isLoading: addingExam }] = useAddExamMutation();
  const [addExamResult, { isLoading: addingResult }] = useAddExamResultMutation();

  const submitAddExam = async (payload) => {
    try {
      const res = await addExam(payload).unwrap();
      notify.success(res?.message || "تمت إضافة المذاكرة");
      setOpenAddExam(false);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل إضافة المذاكرة");
    }
  };

  const submitAddResult = async (payload) => {
    try {
      const res = await addExamResult(payload).unwrap();
      notify.success(res?.message || "تمت إضافة العلامة");
      return res;
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل إضافة العلامة");
      throw err;
    }
  };

  /* ================= EDIT/DELETE EXAMS ================= */
  const [updateExam, { isLoading: updatingExam }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: deletingExam }] = useDeleteExamMutation();
  const [openEditExam, setOpenEditExam] = useState(false);
  const [activeExamId, setActiveExamId] = useState(null);
  const [openDeleteExam, setOpenDeleteExam] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const { data: examDetailsRes, isLoading: loadingExamDetails } =
    useGetExamByIdQuery(activeExamId, { skip: !openEditExam || !activeExamId });

  const activeExam = useMemo(() => normalizeObject(examDetailsRes), [examDetailsRes]);

  const handleEditExam = (row) => {
    const id = getExamId(row);
    if (!id) return notify.error("لا يوجد معرف للمذاكرة");
    setActiveExamId(id);
    setOpenEditExam(true);
  };

  const submitEditExam = async (payload) => {
    try {
      const res = await updateExam({ id: activeExamId, ...payload }).unwrap();
      notify.success(res?.message || "تم تعديل المذاكرة");
      setOpenEditExam(false);
      setActiveExamId(null);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل تعديل المذاكرة");
    }
  };

  const handleDeleteExam = (row) => {
    const id = getExamId(row);
    if (!id) return notify.error("لا يوجد معرف للمذاكرة");
    setExamToDelete(row);
    setOpenDeleteExam(true);
  };

  const confirmDeleteExam = async () => {
    try {
      const id = getExamId(examToDelete);
      if (!id) return notify.error("لا يوجد معرف للمذاكرة");
      await deleteExam(id).unwrap();
      notify.success("تم حذف المذاكرة");
      setOpenDeleteExam(false);
      setExamToDelete(null);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل حذف المذاكرة");
    }
  };

  /* ================= EDIT/DELETE RESULTS ================= */
  const [pendingResultsMap, setPendingResultsMap] = useState({});
  const markResultPending = (id, type) => {
    if (!id) return;
    setPendingResultsMap((p) => ({ ...p, [String(id)]: { type, at: Date.now() } }));
  };
  const clearResultPending = (id) => {
    if (!id) return;
    setPendingResultsMap((p) => {
      const copy = { ...p };
      delete copy[String(id)];
      return copy;
    });
  };

  const [updateExamResult, { isLoading: updatingResult }] = useUpdateExamResultMutation();
  const [deleteExamResult, { isLoading: deletingResult }] = useDeleteExamResultMutation();
  const [openEditResult, setOpenEditResult] = useState(false);
  const [activeResultId, setActiveResultId] = useState(null);
  const [openDeleteResult, setOpenDeleteResult] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);

  const { data: resultDetailsRes, isLoading: loadingResultDetails } =
    useGetExamResultByIdQuery(activeResultId, { skip: !openEditResult || !activeResultId });

  const activeResult = useMemo(() => normalizeObject(resultDetailsRes), [resultDetailsRes]);

  const handleEditResult = (row) => {
    const id = getResultId(row);
    if (!id) return notify.error("لا يوجد معرف للعلامة");
    setActiveResultId(id);
    setOpenEditResult(true);
  };

  const submitEditResult = async (payload) => {
    try {
      const res = await updateExamResult({ id: activeResultId, ...payload }).unwrap();
      notify.success(res?.message || "تمت العملية");
      if (isPendingResponse(res)) markResultPending(activeResultId, "edit");
      else clearResultPending(activeResultId);
      return res;
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل تعديل العلامة");
      throw err;
    }
  };

  const handleDeleteResult = (row) => {
    const id = getResultId(row);
    if (!id) return notify.error("لا يوجد معرف للعلامة");
    setResultToDelete(row);
    setOpenDeleteResult(true);
  };

  const confirmDeleteResult = async () => {
    try {
      const id = getResultId(resultToDelete);
      if (!id) return notify.error("لا يوجد معرف للعلامة");
      const res = await deleteExamResult(id).unwrap();
      notify.success(res?.message || "تمت العملية");
      if (isPendingResponse(res)) markResultPending(id, "delete");
      else clearResultPending(id);
      setOpenDeleteResult(false);
      setResultToDelete(null);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل حذف العلامة");
    }
  };

  /* ================= UI ================= */
  const toggleMode = () => setMode((m) => (m === "exams" ? "results" : "exams"));
  const handleAdd = () => {
    if (mode === "exams") setOpenAddExam(true);
    else setOpenAddResult(true);
  };
  const rowKey = (r) => {
    if (mode === "exams") return String(getExamId(r) ?? "");
    return String(getResultId(r) ?? "");
  };

  if (loading) {
    const tableHeaders = mode === "exams"
        ? ["#", "اسم المذاكرة", "التاريخ", "نوع الامتحان", "الوقت", "العلامة العظمى", "علامة النجاح", "الحالة", "إجراءات"]
        : ["#", "الطالب", "المادة", "نوع الإمتحان", "التاريخ", "العلامة", "النتيجة", "الإجراءات"];
    return (
      <div dir="rtl" className="w-full h-full p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">{mode === "exams" ? "مذكرات الدورة" : "علامات الامتحانات"}</h1>
            <Breadcrumb />
          </div>
        </div>
        <PageSkeleton tableHeaders={tableHeaders} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{mode === "exams" ? "مذكرات الدورة" : "علامات الامتحانات"}</h1>
          <Breadcrumb />
        </div>
        <div className="flex flex-col gap-4 items-start md:items-end">
          <div className="flex flex-wrap gap-4">
            <SearchableSelect
              label="اسم الطالب"
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              options={[{ value: "", label: "كل الطلاب" }, ...students.map((s) => ({ value: String(s.id), label: s.full_name }))]}
              allowClear
            />
            <SearchableSelect
              label="الشعبة"
              value={selectedBatchId}
              onChange={setSelectedBatchId}
              options={[{ value: "", label: "كل الشعب" }, ...batches.map((b) => ({ value: String(b.id), label: b.name }))]}
              allowClear
            />
          </div>
          <div className="flex gap-2">
            <PrintExportActions 
              data={filteredRows}
              selectedIds={selectedIds}
              columns={exportColumns}
              title={mode === "exams" ? "مذكرات الدورة" : "علامات الامتحانات"}
              filename={mode === "exams" ? "المذكرات" : "العلامات"}
            />
          </div>
        </div>
      </div>

      <ActionsRow
        showSelectAll
        isAllSelected={isAllSelected}
        onToggleSelectAll={() => setSelectedIds(isAllSelected ? [] : filteredRows.map(rowKey))}
        viewLabel={mode === "exams" ? "عرض العلامات" : "عرض المذكرات"}
        onView={toggleMode}
        addLabel={mode === "exams" ? "إضافة مذاكرة" : "إضافة علامة"}
        onAdd={handleAdd}
      />

      {mode === "exams" ? (
        <ExamsTable
          rows={filteredRows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEditExam}
          onDelete={handleDeleteExam}
        />
      ) : (
        <ExamResultsTable
          rows={filteredRows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEditResult}
          onDelete={handleDeleteResult}
          pendingMap={pendingResultsMap}
        />
      )}

      <ExamAddModal open={openAddExam} onClose={() => setOpenAddExam(false)} onSubmit={submitAddExam} loading={addingExam} />
      <ExamResultAddModal open={openAddResult} onClose={() => setOpenAddResult(false)} onSubmit={submitAddResult} loading={addingResult} filterParams={params} />
      <ExamAddModal open={openEditExam} title="تعديل مذاكرة" onClose={() => { setOpenEditExam(false); setActiveExamId(null); }} onSubmit={submitEditExam} initialData={activeExam} loading={updatingExam || loadingExamDetails} />
      
      <DeleteConfirmModal
        isOpen={openDeleteExam}
        loading={deletingExam}
        title="حذف مذاكرة"
        description={`هل أنت متأكد من حذف ${examToDelete?.name}؟`}
        onClose={() => setOpenDeleteExam(false)}
        onConfirm={confirmDeleteExam}
      />

      <DeleteConfirmModal
        isOpen={openDeleteResult}
        loading={deletingResult}
        title="حذف علامة"
        description="هل أنت متأكد من الحذف؟"
        onClose={() => setOpenDeleteResult(false)}
        onConfirm={confirmDeleteResult}
      />
    </div>
  );
}
