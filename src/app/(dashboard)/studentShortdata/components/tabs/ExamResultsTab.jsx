"use client";

import { useMemo, useState, useEffect } from "react";
import Pagination from "@/components/common/Pagination";
import { useGetFilteredExamResultsQuery } from "@/store/services/examsApi";

const PAGE_SIZE = 6;

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

  const [page, setPage] = useState(1);

  const examResults = useMemo(() => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    return [];
  }, [data]);

  const filteredResults = useMemo(() => {
    return filterExamResultsByRange(examResults, examResultsRange);
  }, [examResults, examResultsRange]);

  useEffect(() => {
    setPage(1);
  }, [filteredResults.length]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));

  const pagedResults = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredResults.slice(start, start + PAGE_SIZE);
  }, [filteredResults, page]);

  if (isLoading) {
    return (
      <div className="text-gray-500 text-sm text-center py-6">
        جاري تحميل النتائج الامتحانية...
      </div>
    );
  }

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
            value={filteredResults.length || 0}
          />
          <SummaryItem
            label="عدد الناجح"
            value={
              filteredResults.filter((r) => Number(r.is_passed) === 1).length
            }
          />
          <SummaryItem
            label="عدد الراسب"
            value={
              filteredResults.filter((r) => Number(r.is_passed) !== 1).length
            }
          />
        </div>
      </div>

      {!filteredResults.length ? (
        <div className="py-8 text-center text-gray-400">
          لا توجد نتائج امتحانية ضمن التاريخ المحدد.
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-pink-50 text-gray-700">
                    <th className="p-3 rounded-r-xl">#</th>
                    <th className="p-3">رقم الامتحان</th>
                    <th className="p-3">تاريخ النتيجة</th>
                    <th className="p-3">العلامة</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 rounded-l-xl">الملاحظات</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedResults.map((item, index) => {
                    const globalIndex = (page - 1) * PAGE_SIZE + index + 1;

                    return (
                      <tr
                        key={item.id ?? `${page}-${index}`}
                        className="bg-white hover:bg-pink-50 transition"
                      >
                        <td className="p-3 rounded-r-xl font-medium">
                          {globalIndex}
                        </td>
                        <td className="p-3">{item.exam_id ?? "—"}</td>
                        <td className="p-3">
                          {toYMDFromAny(item.created_at) || "—"}
                        </td>
                        <td className="p-3 font-semibold">
                          {item.obtained_marks ?? "—"}
                        </td>
                        <td className="p-3">
                          {Number(item.is_passed) === 1 ? "ناجح" : "راسب"}
                        </td>
                        <td className="p-3 rounded-l-xl">
                          {item.remarks || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hideIfSinglePage
              siblingCount={1}
              className="mt-4"
            />
          </div>

          <div className="md:hidden space-y-3">
            {pagedResults.map((item, index) => {
              const globalIndex = (page - 1) * PAGE_SIZE + index + 1;

              return (
                <div
                  key={item.id ?? `${page}-${index}`}
                  className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm"
                >
                  <div className="flex justify-between mb-2 text-xs text-gray-500">
                    <span>النتيجة</span>
                    <span className="font-semibold text-gray-800">
                      #{globalIndex}
                    </span>
                  </div>

                  <Item label="رقم الامتحان" value={item.exam_id ?? "—"} />
                  <Item
                    label="تاريخ النتيجة"
                    value={toYMDFromAny(item.created_at) || "—"}
                  />
                  <Item
                    label="العلامة"
                    value={item.obtained_marks ?? "—"}
                    bold
                  />
                  <Item
                    label="الحالة"
                    value={Number(item.is_passed) === 1 ? "ناجح" : "راسب"}
                  />
                  <Item label="الملاحظات" value={item.remarks || "—"} />
                </div>
              );
            })}

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hideIfSinglePage
              siblingCount={1}
              className="mt-4"
            />
          </div>
        </>
      )}
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

function Item({ label, value, bold }) {
  return (
    <div className="flex justify-between mb-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} text-gray-800`}>
        {value}
      </span>
    </div>
  );
}
