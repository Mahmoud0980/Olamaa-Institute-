"use client";

import { useEffect, useMemo, useState } from "react";

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

  // exams edit/delete
  useGetExamByIdQuery,
  useUpdateExamMutation,
  useDeleteExamMutation,

  // ✅ results edit/delete
  useGetExamResultByIdQuery,
  useUpdateExamResultMutation,
  useDeleteExamResultMutation,
} from "@/store/services/examsApi";

import ExamsTable from "./components/ExamsTable";
import ExamResultsTable from "./components/ExamResultsTable";
import ExamAddModal from "./components/ExamAddModal";
import ExamResultAddModal from "./components/ExamResultAddModal";

/* ================= Helpers ================= */

function normalizeArray(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

function normalizeResultsItems(res) {
  const items = res?.data?.items;
  if (Array.isArray(items)) return items;
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
  // modes: exams | results
  const [mode, setMode] = useState("exams");

  // filters
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const students = useMemo(() => normalizeArray(studentsRes), [studentsRes]);

  const { data: batchesRes } = useGetBatchesQuery();
  const batches = useMemo(() => normalizeArray(batchesRes), [batchesRes]);

  const params = useMemo(
    () =>
      buildParams({ studentId: selectedStudentId, batchId: selectedBatchId }),
    [selectedStudentId, selectedBatchId],
  );

  // queries
  const {
    data: examsRes,
    isLoading: loadingExams,
    isFetching: fetchingExams,
  } = useGetFilteredExamsQuery(params, { skip: mode !== "exams" });

  const {
    data: resultsRes,
    isLoading: loadingResults,
    isFetching: fetchingResults,
  } = useGetStudentExamResultsQuery(params, { skip: mode !== "results" });

  const loading =
    mode === "exams"
      ? loadingExams || fetchingExams
      : loadingResults || fetchingResults;

  const rows = useMemo(() => {
    if (mode === "exams") return normalizeArray(examsRes);
    return normalizeResultsItems(resultsRes);
  }, [mode, examsRes, resultsRes]);
  console.log("FIRST RESULT ROW:", rows?.[0]);
  // selection (optional)
  const [selectedIds, setSelectedIds] = useState([]);
  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;

  useEffect(() => {
    setSelectedIds([]);
  }, [mode, selectedStudentId, selectedBatchId]);

  /* ================= ADD ================= */

  const [openAddExam, setOpenAddExam] = useState(false);
  const [openAddResult, setOpenAddResult] = useState(false);

  const [addExam, { isLoading: addingExam }] = useAddExamMutation();
  const [addExamResult, { isLoading: addingResult }] =
    useAddExamResultMutation();

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
      setOpenAddResult(false);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل إضافة العلامة");
    }
  };

  /* ================= EDIT/DELETE EXAMS (memos) ================= */

  const [updateExam, { isLoading: updatingExam }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: deletingExam }] = useDeleteExamMutation();

  const [openEditExam, setOpenEditExam] = useState(false);
  const [activeExamId, setActiveExamId] = useState(null);

  const [openDeleteExam, setOpenDeleteExam] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const { data: examDetailsRes, isLoading: loadingExamDetails } =
    useGetExamByIdQuery(activeExamId, {
      skip: !openEditExam || !activeExamId,
    });

  const activeExam = useMemo(
    () => normalizeObject(examDetailsRes),
    [examDetailsRes],
  );

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

      const res = await deleteExam({ id, reason: "طلب حذف" }).unwrap();
      notify.success(res?.message || "تم حذف المذاكرة");
      setOpenDeleteExam(false);
      setExamToDelete(null);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل حذف المذاكرة");
    }
  };

  /* ================= EDIT/DELETE RESULTS (grades) + pending ================= */

  const [pendingResultsMap, setPendingResultsMap] = useState({});

  const markResultPending = (id, type) => {
    if (!id) return;
    setPendingResultsMap((p) => ({
      ...p,
      [String(id)]: { type, at: Date.now() },
    }));
  };

  const clearResultPending = (id) => {
    if (!id) return;
    setPendingResultsMap((p) => {
      const copy = { ...p };
      delete copy[String(id)];
      return copy;
    });
  };

  const [updateExamResult, { isLoading: updatingResult }] =
    useUpdateExamResultMutation();
  const [deleteExamResult, { isLoading: deletingResult }] =
    useDeleteExamResultMutation();

  const [openEditResult, setOpenEditResult] = useState(false);
  const [activeResultId, setActiveResultId] = useState(null);

  const [openDeleteResult, setOpenDeleteResult] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);

  const { data: resultDetailsRes, isLoading: loadingResultDetails } =
    useGetExamResultByIdQuery(activeResultId, {
      skip: !openEditResult || !activeResultId,
    });

  const activeResult = useMemo(
    () => normalizeObject(resultDetailsRes),
    [resultDetailsRes],
  );

  const handleEditResult = (row) => {
    const id = getResultId(row);
    if (!id) return notify.error("لا يوجد معرف للعلامة");
    setActiveResultId(id);
    setOpenEditResult(true);
  };

  const submitEditResult = async (payload) => {
    try {
      const res = await updateExamResult({
        id: activeResultId,
        ...payload,
      }).unwrap();

      notify.success(res?.message || "تمت العملية");

      if (isPendingResponse(res)) markResultPending(activeResultId, "edit");
      else clearResultPending(activeResultId);

      setOpenEditResult(false);
      setActiveResultId(null);
    } catch (err) {
      notify.error(firstErr(err) || err?.data?.message || "فشل تعديل العلامة");
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

      const res = await deleteExamResult({ id, reason: "طلب حذف" }).unwrap();
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

  const toggleMode = () =>
    setMode((m) => (m === "exams" ? "results" : "exams"));

  const handleAdd = () => {
    if (mode === "exams") setOpenAddExam(true);
    else setOpenAddResult(true);
  };

  const rowKey = (r) => {
    if (mode === "exams") return String(getExamId(r) ?? "");
    return String(getResultId(r) ?? "");
  };

  return (
    <div dir="rtl" className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">
            {mode === "exams" ? "مذكرات الدورة" : "علامات الامتحانات"}
          </h1>
          <Breadcrumb />
        </div>

        <div className="flex flex-wrap gap-4">
          <SearchableSelect
            label="اسم الطالب"
            value={selectedStudentId}
            onChange={setSelectedStudentId}
            options={[
              { value: "", label: "كل الطلاب" },
              ...students.map((s) => ({
                value: String(s.id),
                label: s.full_name,
              })),
            ]}
            allowClear
          />

          <SearchableSelect
            label="الشعبة"
            value={selectedBatchId}
            onChange={setSelectedBatchId}
            options={[
              { value: "", label: "كل الشعب" },
              ...batches.map((b) => ({ value: String(b.id), label: b.name })),
            ]}
            allowClear
          />
        </div>
      </div>

      <ActionsRow
        showSelectAll
        isAllSelected={isAllSelected}
        onToggleSelectAll={() =>
          setSelectedIds(isAllSelected ? [] : rows.map(rowKey))
        }
        viewLabel={mode === "exams" ? "عرض العلامات" : "عرض المذكرات"}
        onView={toggleMode}
        addLabel={mode === "exams" ? "إضافة مذاكرة" : "إضافة علامة"}
        onAdd={handleAdd}
      />

      {loading ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
          جارٍ التحميل...
        </div>
      ) : mode === "exams" ? (
        <ExamsTable
          rows={rows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEditExam}
          onDelete={handleDeleteExam}
        />
      ) : (
        <ExamResultsTable
          rows={rows}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onEdit={handleEditResult}
          onDelete={handleDeleteResult}
          pendingMap={pendingResultsMap}
        />
      )}

      {/* ADD */}
      <ExamAddModal
        open={openAddExam}
        onClose={() => setOpenAddExam(false)}
        onSubmit={submitAddExam}
        loading={addingExam}
      />

      <ExamResultAddModal
        open={openAddResult}
        onClose={() => setOpenAddResult(false)}
        onSubmit={submitAddResult}
        loading={addingResult}
        filterParams={params}
      />

      {/* EDIT EXAM */}
      <ExamAddModal
        open={openEditExam}
        title="تعديل مذاكرة"
        onClose={() => {
          setOpenEditExam(false);
          setActiveExamId(null);
        }}
        onSubmit={submitEditExam}
        initialData={activeExam}
        loading={updatingExam || loadingExamDetails}
      />

      {/* DELETE EXAM */}
      <DeleteConfirmModal
        isOpen={openDeleteExam}
        loading={deletingExam}
        title="حذف مذاكرة"
        description="هل أنت متأكد من حذف المذاكرة؟"
        onClose={() => setOpenDeleteExam(false)}
        onConfirm={confirmDeleteExam}
      />

      {/* EDIT RESULT (✅ نفس مودال الإضافة لكن initialData + showReason) */}
      <ExamResultAddModal
        open={openEditResult}
        title="تعديل علامة"
        onClose={() => {
          setOpenEditResult(false);
          setActiveResultId(null);
        }}
        onSubmit={submitEditResult}
        loading={updatingResult || loadingResultDetails}
        filterParams={params}
        initialData={activeResult}
        showReason
      />

      {/* DELETE RESULT */}
      <DeleteConfirmModal
        isOpen={openDeleteResult}
        loading={deletingResult}
        title="حذف علامة"
        description="هل أنت متأكد من حذف العلامة؟"
        onClose={() => setOpenDeleteResult(false)}
        onConfirm={confirmDeleteResult}
      />
    </div>
  );
}
