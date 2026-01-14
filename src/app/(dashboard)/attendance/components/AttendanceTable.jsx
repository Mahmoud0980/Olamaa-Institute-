"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Pagination from "@/components/common/Pagination";
import AttendanceTableSkeleton from "./AttendanceTableSkeleton";

const AR_DAYS = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

function dayNameFromYMD(ymd) {
  if (!ymd) return "-";
  const d = new Date(`${ymd}T00:00:00`);
  return AR_DAYS[d.getDay()] || "-";
}
function formatTime(val) {
  if (!val) return "-";
  const t = String(val).split(" ")[1] || "";
  if (!t) return "-";
  const [hh, mm] = t.split(":");
  return hh && mm ? `${hh}:${mm}` : t;
}
const statusBadge = (status) => {
  switch (status) {
    case "present":
      return { text: "موجود", className: "bg-green-100 text-green-700" };
    case "late":
      return { text: "متأخر", className: "bg-orange-100 text-orange-700" };
    case "absent":
      return { text: "غائب", className: "bg-red-100 text-red-700" };
    case "excused":
      return { text: "إذن", className: "bg-blue-100 text-blue-700" };
    default:
      return { text: status || "-", className: "bg-gray-100 text-gray-600" };
  }
};

export default function AttendanceTable({
  records = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onEdit,
  onDelete,
  onRowClick,

  // ✅ Maps
  studentsById = {},
  batchesById = {},
  branchesById = {},
}) {
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const safe = Array.isArray(records) ? records : [];
  const totalPages = Math.ceil(safe.length / pageSize) || 1;

  const paginated = useMemo(
    () => safe.slice((page - 1) * pageSize, page * pageSize),
    [safe, page]
  );

  useEffect(() => setPage(1), [safe]);

  const toggleSelect = (rec) => {
    const exists = selectedIds.includes(rec.id);
    const updated = exists
      ? selectedIds.filter((id) => id !== rec.id)
      : [...selectedIds, rec.id];
    onSelectChange?.(updated);
  };

  if (isLoading) return <AttendanceTableSkeleton />;

  if (safe.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700">
              <th className="p-3 text-center rounded-r-xl">#</th>
              <th className="p-3">الطالب</th>
              <th className="p-3">الفرع</th>
              <th className="p-3">الشعبة</th>
              <th className="p-3">اليوم</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3 text-center">التفقد</th>
              <th className="p-3">وقت الوصول</th>
              <th className="p-3">وقت الانصراف</th>
              <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((rec, index) => {
              const rowNumber = (page - 1) * pageSize + index + 1;
              const badge = statusBadge(rec.status);
              const day = dayNameFromYMD(rec.attendance_date);

              const student = studentsById?.[rec.student_id];
              const studentName = student?.full_name || "-";

              const batch = batchesById?.[rec.batch_id];
              const batchName = batch?.name || "-";

              const branch =
                branchesById?.[rec.institute_branch_id] ||
                batch?.institute_branch ||
                null;
              const branchName = branch?.name || "-";

              return (
                <tr
                  key={rec.id}
                  onClick={() => onRowClick?.(rec)}
                  className="bg-white hover:bg-pink-50 transition cursor-pointer"
                >
                  <td className="p-3 text-center rounded-r-xl">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#6F013F]"
                        checked={selectedIds.includes(rec.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(rec)}
                      />
                      <span>{rowNumber}</span>
                    </div>
                  </td>

                  <td className="p-3 font-medium whitespace-nowrap">
                    {studentName}
                  </td>

                  <td className="p-3 whitespace-nowrap">{branchName}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="max-w-[220px] whitespace-normal break-words leading-5">
                      {batchName}
                    </div>
                  </td>

                  <td className="p-3 whitespace-nowrap">{day}</td>
                  <td className="p-3 whitespace-nowrap">
                    {rec.attendance_date || "-"}
                  </td>

                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-xl ${badge.className}`}
                    >
                      {badge.text}
                    </span>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    {formatTime(rec.recorded_at)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatTime(
                      rec.exit_at || rec.exit_time || rec.departure_time
                    )}
                  </td>

                  <td
                    className="p-3 text-center rounded-l-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center gap-6 mt-1">
                      <button onClick={() => onDelete?.(rec)}>
                        <Image
                          src="/icons/Trash.png"
                          alt="trash"
                          width={20}
                          height={20}
                        />
                      </button>
                      <button onClick={() => onEdit?.(rec)}>
                        <Image
                          src="/icons/Edit.png"
                          alt="edit"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile (اختياري توسّع لاحقاً) */}
      <div className="md:hidden space-y-4 mt-4">
        {paginated.map((rec, index) => {
          const rowNumber = (page - 1) * pageSize + index + 1;
          const badge = statusBadge(rec.status);

          const student = studentsById?.[rec.student_id];
          const studentName = student?.full_name || "-";

          const batch = batchesById?.[rec.batch_id];
          const batchName = batch?.name || "-";

          const branch =
            branchesById?.[rec.institute_branch_id] || batch?.institute_branch;
          const branchName = branch?.name || "-";

          return (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer"
              onClick={() => onRowClick?.(rec)}
              role="button"
            >
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">#</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{rowNumber}</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#6F013F]"
                    checked={selectedIds.includes(rec.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleSelect(rec)}
                  />
                </div>
              </div>

              <Row label="الطالب" value={studentName} strong />
              <Row label="الفرع" value={branchName} />
              <Row label="الشعبة" value={batchName} />
              <Row label="التاريخ" value={rec.attendance_date || "-"} />

              <div className="flex justify-between mb-2">
                <span className="text-gray-500">التفقد:</span>
                <span
                  className={`px-3 py-1 text-xs rounded-xl ${badge.className}`}
                >
                  {badge.text}
                </span>
              </div>

              <Row label="وقت الوصول" value={formatTime(rec.recorded_at)} />
              <Row
                label="وقت الانصراف"
                value={formatTime(
                  rec.exit_at || rec.exit_time || rec.departure_time
                )}
              />

              <div
                className="flex justify-center gap-6 mt-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => onEdit?.(rec)}>
                  <Image
                    src="/icons/Edit.png"
                    alt="edit"
                    width={20}
                    height={20}
                  />
                </button>
                <button onClick={() => onDelete?.(rec)}>
                  <Image
                    src="/icons/Trash.png"
                    alt="trash"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span className={strong ? "font-semibold" : ""}>{value || "-"}</span>
    </div>
  );
}
