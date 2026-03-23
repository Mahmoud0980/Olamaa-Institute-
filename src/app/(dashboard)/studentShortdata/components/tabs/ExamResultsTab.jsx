"use client";

import { useMemo } from "react";
import DataTable from "@/components/common/DataTable";
import { useGetFilteredExamResultsQuery } from "@/store/services/examsApi";

function toYMD(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA");
}

function toYMDFromAny(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return toYMD(value);
  return "";
}

function normalizeRange(start, end) {
  const a = toYMD(start);
  const b = toYMD(end);
  if (!a || !b) return { min: "", max: "" };
  return a <= b ? { min: a, max: b } : { min: b, max: a };
}

function filterExamResultsByRange(results, range) {
  const start = range?.start || null;
  const end = range?.end || null;

  if (!start && !end) return results;

  // ✅ تاريخ واحد فقط
  if (start && !end) {
    const target = toYMD(start);
    return results.filter((item) => {
      const ymd = toYMDFromAny(item.created_at || item.updated_at);
      return ymd && ymd === target;
    });
  }

  // ✅ رينج
  if (start && end) {
    const { min, max } = normalizeRange(start, end);
    return results.filter((item) => {
      const ymd = toYMDFromAny(item.created_at || item.updated_at);
      return ymd && ymd >= min && ymd <= max;
    });
  }

  return results;
}

export default function ExamResultsTab({ student, examResultsRange }) {
  const { data, isLoading, isError } = useGetFilteredExamResultsQuery(
    { student_id: student?.id },
    { skip: !student?.id },
  );

  const examResults = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const filteredResults = useMemo(() => {
    return filterExamResultsByRange(examResults, examResultsRange);
  }, [examResults, examResultsRange]);

  const summary = useMemo(() => ({
    total: filteredResults.length,
    passed: filteredResults.filter((r) => Number(r.is_passed) === 1).length,
    failed: filteredResults.filter((r) => Number(r.is_passed) !== 1).length,
  }), [filteredResults]);

  const columns = useMemo(() => [
    { 
      header: "رقم الامتحان", 
      key: "exam_id" 
    },
    { 
      header: "تاريخ النتيجة", 
      key: "created_at",
      render: (val) => toYMDFromAny(val) || "—"
    },
    { 
      header: "العلامة", 
      key: "obtained_marks",
      render: (val) => <span className="font-semibold">{val ?? "—"}</span>
    },
    { 
      header: "الحالة", 
      key: "is_passed",
      render: (val) => (Number(val) === 1 ? "ناجح" : "راسب")
    },
    { 
      header: "الملاحظات", 
      key: "remarks" 
    },
  ], []);

  if (isError) {
    return (
      <div className="text-red-500 text-sm text-center py-6">
        فشل تحميل النتائج الامتحانية.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-6">
          <SummaryItem label="اسم الطالب" value={student?.full_name || "—"} />
          <SummaryItem
            label="عدد النتائج"
            value={summary.total}
          />
          <SummaryItem
            label="عدد الناجح"
            value={summary.passed}
          />
          <SummaryItem
            label="عدد الراسب"
            value={summary.failed}
          />
        </div>
      </div>

      <DataTable
        data={filteredResults}
        columns={columns}
        isLoading={isLoading}
        showCheckbox={false}
        pageSize={6}
        emptyMessage="لا توجد نتائج امتحانية ضمن التاريخ المحدد."
      />
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 whitespace-nowrap">{label}:</span>
      <span className="text-sm font-semibold text-gray-800 truncate">
        {value}
      </span>
    </div>
  );
}
