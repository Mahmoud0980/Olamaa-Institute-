"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import BatchSubjectSelect from "@/components/common/BatchSubjectSelect";
import DatePickerSmart from "@/components/common/DatePickerSmart";
import TimePickerSmart from "@/components/common/TimePickerSmart";

import { useGetBatchSubjectsSummaryQuery } from "@/store/services/batcheSubjectsApi";
import { useGetExamTypesQuery } from "@/store/services/examTypesApi";

function toNumOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function normalizeArray(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

function parseTime12To24(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (!raw) return null;

  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return raw || null; // إذا كانت أصلاً HH:mm خليه يمر

  let hh = Number(m[1]);
  const mm = m[2];
  const period = m[3];

  if (period === "AM") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }

  return `${String(hh).padStart(2, "0")}:${mm}`;
}

function parseTime24To12(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;

  let hh = Number(m[1]);
  const mm = m[2];
  const period = hh >= 12 ? "PM" : "AM";

  if (hh === 0) hh = 12;
  else if (hh > 12) hh -= 12;

  return `${String(hh).padStart(2, "0")}:${mm} ${period}`;
}

export default function ExamAddModal({
  open,
  title = "إضافة مذاكرة",
  loading = false,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const step = 1;
  const total = 1;

  const { data: summaryRes, isLoading: loadingSummary } =
    useGetBatchSubjectsSummaryQuery(undefined, { skip: !open });

  const { data: typesRes, isLoading: loadingTypes } = useGetExamTypesQuery(
    undefined,
    { skip: !open },
  );

  const summary = useMemo(() => normalizeArray(summaryRes), [summaryRes]);
  const examTypes = useMemo(() => normalizeArray(typesRes), [typesRes]);

  const batchSubjectOptions = useMemo(() => {
    return summary
      .filter((x) => x?.batch_subject_id != null)
      .map((x) => ({
        value: String(x.batch_subject_id),
        batch: x.batch_name,
        subject: x.subject_instructor_name,
      }));
  }, [summary]);

  const examTypeOptions = useMemo(() => {
    return examTypes
      .filter((t) => t?.id != null)
      .map((t) => ({
        value: String(t.id),
        label: String(t.name ?? "").trim() || `نوع #${t.id}`,
      }));
  }, [examTypes]);

  const statusOptions = useMemo(
    () => [
      { value: "scheduled", label: "مجدول" },
      { value: "completed", label: "مكتمل" },
      { value: "cancelled", label: "ملغى" },
    ],
    [],
  );

  const emptyForm = useMemo(
    () => ({
      batch_subject_id: "",
      name: "",
      exam_type_id: "",
      total_marks: "",
      passing_marks: "",
      exam_date: "",
      exam_time: "",
      exam_end_time: "",
      status: "scheduled",
      remarks: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        batch_subject_id: String(initialData.batch_subject_id ?? ""),
        name: initialData.name ?? "",
        exam_type_id: String(initialData.exam_type_id ?? ""),
        total_marks: initialData.total_marks ?? "",
        passing_marks: initialData.passing_marks ?? "",
        exam_date: initialData.exam_date ?? "",
        exam_time: initialData.exam_time
          ? parseTime24To12(String(initialData.exam_time).slice(0, 5))
          : "",
        exam_end_time: initialData.exam_end_time
          ? parseTime24To12(String(initialData.exam_end_time).slice(0, 5))
          : "",
        status: initialData.status ?? "scheduled",
        remarks: initialData.remarks ?? "",
      });
    } else {
      setForm({
        ...emptyForm,
        exam_type_id: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const validate = () => {
    if (!form.batch_subject_id) return "يرجى اختيار الدورة/المادة";
    if (!form.name.trim()) return "اسم الامتحان مطلوب";
    if (!form.exam_type_id) return "يرجى اختيار نوع الامتحان";
    if (!form.total_marks) return "العلامة العظمى مطلوبة";
    if (!form.passing_marks) return "العلامة الدنيا مطلوبة";
    if (!form.exam_date) return "التاريخ مطلوب";
    if (!form.exam_time) return "الوقت مطلوب";
    if (!form.status) return "الحالة مطلوبة";

    const total = Number(form.total_marks);
    const pass = Number(form.passing_marks);

    if (!Number.isFinite(total) || total <= 0)
      return "العلامة العظمى غير صحيحة";

    if (!Number.isFinite(pass) || pass < 0) return "العلامة الدنيا غير صحيحة";

    if (pass > total)
      return "علامة النجاح لا يمكن أن تكون أكبر من العلامة العظمى";

    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) return notify.error(err);

    const payload = {
      batch_subject_id: toNumOrNull(form.batch_subject_id),
      name: form.name || null,
      exam_date: form.exam_date || null,
      exam_time: parseTime12To24(form.exam_time),
      exam_end_time: parseTime12To24(form.exam_end_time),
      total_marks: toNumOrNull(form.total_marks),
      passing_marks: toNumOrNull(form.passing_marks),
      status: form.status || "scheduled",
      exam_type_id: toNumOrNull(form.exam_type_id),
      remarks: form.remarks || null,
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
            {initialData ? "تعديل/إضافة مذاكرة" : title}
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
            <BatchSubjectSelect
              label="الدورة"
              required
              value={form.batch_subject_id}
              onChange={(v) => setForm((p) => ({ ...p, batch_subject_id: v }))}
              options={batchSubjectOptions}
              placeholder={
                loadingSummary ? "جارٍ التحميل..." : "اختر الدورة/المادة..."
              }
              disabled={loadingSummary}
            />

            <FormInput
              label="اسم الامتحان"
              required
              placeholder="امتحان منتصف الفصل"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <SearchableSelect
              label="نوع الامتحان"
              required
              value={form.exam_type_id}
              onChange={(v) => setForm((p) => ({ ...p, exam_type_id: v }))}
              options={examTypeOptions}
              placeholder={
                loadingTypes ? "جارٍ التحميل..." : "اختر نوع الامتحان..."
              }
              disabled={loadingTypes}
              allowClear
            />

            <FormInput
              label="العلامة العظمى"
              required
              placeholder="100"
              value={form.total_marks}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  total_marks: e.target.value.replace(/[^\d.]/g, ""),
                }))
              }
            />

            <FormInput
              label="العلامة الدنيا"
              required
              placeholder="60"
              value={form.passing_marks}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  passing_marks: e.target.value.replace(/[^\d.]/g, ""),
                }))
              }
            />

            <DatePickerSmart
              label="التاريخ"
              required
              value={form.exam_date}
              onChange={(iso) =>
                setForm((p) => ({ ...p, exam_date: iso || "" }))
              }
            />

            <TimePickerSmart
              label="الوقت"
              required
              value={form.exam_time}
              onChange={(val) =>
                setForm((p) => ({ ...p, exam_time: val || "" }))
              }
            />

            <TimePickerSmart
              label="وقت الانتهاء"
              value={form.exam_end_time}
              onChange={(val) =>
                setForm((p) => ({ ...p, exam_end_time: val || "" }))
              }
            />

            <SearchableSelect
              label="الحالة"
              required
              value={form.status}
              onChange={(v) => setForm((p) => ({ ...p, status: v }))}
              options={statusOptions}
              placeholder="اختر الحالة..."
              allowClear
            />

            <FormInput
              label="ملاحظات"
              placeholder="امتحان يشمل الوحدتين الأولى والثانية"
              value={form.remarks}
              onChange={(e) =>
                setForm((p) => ({ ...p, remarks: e.target.value }))
              }
            />
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
            nextLabel={initialData ? "حفظ التعديل" : "حفظ"}
          />
        </div>
      </div>

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
