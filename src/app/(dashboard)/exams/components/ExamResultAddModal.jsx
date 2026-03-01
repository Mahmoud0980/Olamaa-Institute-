// ./components/ExamResultAddModal.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import { useGetFilteredExamsQuery } from "@/store/services/examsApi";
import { useStudentDetailsQuery } from "@/store/services/studentDetailsApi";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function normalizeArray(res) {
  if (Array.isArray(res?.data?.items)) return res.data.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

export default function ExamResultAddModal({
  open,
  title = "إضافة علامة",
  loading = false,
  onClose,
  onSubmit,
  filterParams = {},
  initialData = null, // ✅ جديد
  showReason = false, // ✅ جديد (مثل الدفعات)
}) {
  const step = 1;
  const total = 1;

  const { data: examsRes, isLoading: loadingExams } = useGetFilteredExamsQuery(
    filterParams,
    { skip: !open },
  );

  const { data: studentsRes, isLoading: loadingStudents } =
    useStudentDetailsQuery(undefined, { skip: !open });

  const exams = useMemo(() => normalizeArray(examsRes), [examsRes]);
  const students = useMemo(
    () => (Array.isArray(studentsRes) ? studentsRes : []),
    [studentsRes],
  );

  const examOptions = useMemo(() => {
    return exams
      .map((e) => {
        const id = e?.id ?? e?.exam_id ?? e?.examId;
        if (id == null) return null;
        const name = e?.name ?? "—";
        const date = e?.exam_date ?? "";
        return { value: String(id), label: `${name} - ${date}` };
      })
      .filter(Boolean);
  }, [exams]);

  const studentOptions = useMemo(() => {
    return students
      .filter((s) => s?.id != null)
      .map((s) => ({
        value: String(s.id),
        label: String(
          s.full_name ??
            `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() ??
            `طالب #${s.id}`,
        ).trim(),
      }))
      .filter((o) => o.label.length > 0);
  }, [students]);

  const emptyForm = useMemo(
    () => ({
      exam_id: "",
      student_id: "",
      obtained_marks: "",
      remarks: "",
      reason: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    // ✅ edit
    if (initialData) {
      setForm({
        exam_id: String(initialData.exam_id ?? ""),
        student_id: String(initialData.student_id ?? ""),
        obtained_marks:
          initialData.obtained_marks ??
          initialData.marks ??
          initialData.score ??
          "",
        remarks: initialData.remarks ?? "",
        reason: "",
      });
    } else {
      // ✅ add
      setForm(emptyForm);
    }
  }, [open, initialData, emptyForm]);

  const selectedExam = useMemo(() => {
    const id = String(form.exam_id || "");
    if (!id) return null;
    return (
      exams.find((e) => String(e?.id ?? e?.exam_id ?? e?.examId) === id) || null
    );
  }, [form.exam_id, exams]);

  const totalMarks = selectedExam?.total_marks ?? null;
  const passingMarks = selectedExam?.passing_marks ?? null;

  const computedIsPassed = useMemo(() => {
    const obt = toNumOrNull(form.obtained_marks);
    const pass = toNumOrNull(passingMarks);
    if (obt == null || pass == null) return null;
    return obt >= pass;
  }, [form.obtained_marks, passingMarks]);

  const validate = () => {
    if (!form.exam_id) return "يرجى اختيار الامتحان";
    if (!form.student_id) return "يرجى اختيار الطالب";
    if (form.obtained_marks === "") return "يرجى إدخال علامة الطالب";

    const obt = Number(form.obtained_marks);
    if (!Number.isFinite(obt) || obt < 0) return "علامة الطالب غير صحيحة";

    const t = toNumOrNull(totalMarks);
    if (t != null && obt > t)
      return "علامة الطالب لا يمكن أن تتجاوز العلامة العظمى";

    if (showReason && initialData && !String(form.reason || "").trim()) {
      return "يرجى إدخال سبب التعديل";
    }

    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) return notify.error(err);

    const payload = {
      exam_id: toNumOrNull(form.exam_id),
      student_id: toNumOrNull(form.student_id),
      obtained_marks: toNumOrNull(form.obtained_marks),
      is_passed: computedIsPassed ?? false,
      remarks: form.remarks || null,
      ...(showReason ? { reason: form.reason || null } : {}),
    };

    onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start backdrop-blur-md">
      <div
        dir="rtl"
        className="w-full sm:w-[520px] bg-white h-full shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            {initialData ? "تعديل علامة" : title}
          </h2>

          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Stepper current={step} total={total} />

          <div className="mt-6 space-y-4">
            <SearchableSelect
              label="الامتحان"
              required
              value={form.exam_id}
              onChange={(v) => setForm((p) => ({ ...p, exam_id: v }))}
              options={examOptions}
              placeholder={
                loadingExams ? "جارٍ التحميل..." : "اختر الامتحان..."
              }
              disabled={loadingExams}
              allowClear
            />

            <FormInput
              label="العلامة العظمى"
              value={totalMarks ?? "—"}
              disabled
              onChange={() => {}}
            />
            <FormInput
              label="العلامة الدنيا"
              value={passingMarks ?? "—"}
              disabled
              onChange={() => {}}
            />

            <SearchableSelect
              label="اسم الطالب"
              required
              value={form.student_id}
              onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
              options={studentOptions}
              placeholder={
                loadingStudents ? "جارٍ التحميل..." : "اختر الطالب..."
              }
              disabled={loadingStudents}
              allowClear
            />

            <FormInput
              label="علامة الطالب"
              required
              placeholder="90"
              value={form.obtained_marks}
              onChange={(e) =>
                setForm((p) => ({ ...p, obtained_marks: e.target.value }))
              }
            />

            <div className="text-sm">
              <span className="text-gray-500">النتيجة:</span>{" "}
              {computedIsPassed == null ? (
                <span className="text-gray-400">—</span>
              ) : computedIsPassed ? (
                <span className="text-green-700 font-medium">ناجح</span>
              ) : (
                <span className="text-red-700 font-medium">راسب</span>
              )}
            </div>

            <FormInput
              label="ملاحظات"
              placeholder="ممتاز جدًا"
              value={form.remarks}
              onChange={(e) =>
                setForm((p) => ({ ...p, remarks: e.target.value }))
              }
            />

            {showReason && initialData && (
              <FormInput
                label="سبب التعديل"
                required
                placeholder="سبب تعديل العلامة..."
                value={form.reason}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reason: e.target.value }))
                }
              />
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-white">
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!initialData}
            loading={loading}
            onNext={handleSubmit}
            onBack={onClose}
            nextLabel={initialData ? "إرسال طلب تعديل" : "حفظ"}
          />
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
