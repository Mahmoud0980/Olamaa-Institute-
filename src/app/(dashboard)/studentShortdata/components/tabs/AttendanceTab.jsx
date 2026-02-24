"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { notify } from "@/lib/helpers/toastify";
import { useGetAttendanceLogQuery } from "@/store/services/studentAttendanceApi";
import Pagination from "@/components/common/Pagination";

function toYMD(d) {
  return d ? d.toLocaleDateString("en-CA") : "";
}

function inRange(dateStr, start, end) {
  if (!start || !end) return true;
  const a = toYMD(start);
  const b = toYMD(end);
  const min = a <= b ? a : b;
  const max = a <= b ? b : a;
  return dateStr >= min && dateStr <= max;
}

// ✅ Key فريد (أفضلية: id -> uuid -> record_id -> created_at -> fallbackIndex)
const getRowKey = (r, fallbackIndex) => {
  if (r?.id != null) return `att-${r.id}`;
  if (r?.uuid) return `att-${r.uuid}`;
  if (r?.record_id != null) return `att-${r.record_id}`;
  if (r?.created_at) return `att-${r.date}-${r.created_at}`;
  return `att-${r?.date || "no-date"}-${fallbackIndex}`;
};

const PAGE_SIZE = 6;

export default function AttendanceTab({
  student,
  attendanceRange,
  editTrigger,
  onEditRequest,
}) {
  const { data: records = [], isLoading } = useGetAttendanceLogQuery({
    id: student?.id,
    range: "all",
  });

  // ✅ فلترة حسب Range
  const filteredRecords = useMemo(() => {
    if (!attendanceRange?.start || !attendanceRange?.end) return records;
    return records.filter((r) =>
      inRange(r.date, attendanceRange.start, attendanceRange.end),
    );
  }, [records, attendanceRange]);

  // ✅ Pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [filteredRecords.length]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, page]);

  // ✅ اختيار سطر واحد: نخزّن rowKey بدل سلسلة ممكن تتكرر
  const [selectedKey, setSelectedKey] = useState(null);

  const toggleSelect = useCallback((rowKey) => {
    setSelectedKey((prev) => (prev === rowKey ? null : rowKey));
  }, []);

  // ✅ نجيب السجل المحدد من filteredRecords بنفس منطق الـ key
  const selectedRecord = useMemo(() => {
    if (!selectedKey) return null;

    for (let idx = 0; idx < filteredRecords.length; idx++) {
      const r = filteredRecords[idx];
      const k = getRowKey(r, idx);
      if (k === selectedKey) return r;
    }
    return null;
  }, [selectedKey, filteredRecords]);

  // ✅ ما بدنا يشتغل على mount لما نبدّل تبويبات
  const prevTriggerRef = useRef(editTrigger);

  useEffect(() => {
    if (prevTriggerRef.current === editTrigger) return;
    prevTriggerRef.current = editTrigger;

    if (!editTrigger) return;

    if (!selectedRecord) {
      notify.error("يرجى تحديد سجل حضور/غياب لتعديله");
      return;
    }

    onEditRequest?.({
      ...selectedRecord,
      student_id: student?.id,
    });
  }, [editTrigger, selectedRecord, onEditRequest, student?.id]);

  if (isLoading) {
    return (
      <p className="text-center text-sm text-gray-500 py-6">
        جاري تحميل بيانات الحضور...
      </p>
    );
  }

  if (!filteredRecords.length) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
        لا يوجد بيانات حضور ضمن هذا المجال.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-3 rounded-r-xl w-10 text-center">#</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">الوصول</th>
              <th className="p-3">الانصراف</th>
              <th className="p-3 rounded-l-xl text-center">الحالة</th>
            </tr>
          </thead>

          <tbody>
            {pagedRecords.map((r, i) => {
              const globalIndex0 = (page - 1) * PAGE_SIZE + i; // 0-based
              const rowKey = getRowKey(r, globalIndex0);
              const checked = selectedKey === rowKey;
              const globalNo = globalIndex0 + 1;

              return (
                <tr key={rowKey} className="hover:bg-pink-50">
                  <td className="p-3 rounded-r-xl text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(rowKey)}
                      className="w-4 h-4 accent-[#6F013F]"
                    />
                  </td>

                  <td className="p-3">
                    <span className="text-gray-400 text-xs ml-2">
                      #{globalNo}
                    </span>
                    {r.date}
                  </td>

                  <td className="p-3">{r.check_in || "—"}</td>
                  <td className="p-3">{r.check_out || "—"}</td>

                  <td className="p-3 rounded-l-xl text-center">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          hideIfSinglePage
          siblingCount={1}
          className="mt-4"
        />
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {pagedRecords.map((r, i) => {
          const globalIndex0 = (page - 1) * PAGE_SIZE + i;
          const rowKey = getRowKey(r, globalIndex0);
          const checked = selectedKey === rowKey;
          const globalNo = globalIndex0 + 1;

          return (
            <div key={rowKey} className="rounded-xl p-4 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">تحديد</div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">#{globalNo}</span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelect(rowKey)}
                    className="w-4 h-4 accent-[#6F013F]"
                  />
                </div>
              </div>

              <Row label="التاريخ" value={r.date} />
              <Row label="الوصول" value={r.check_in || "—"} />
              <Row label="الانصراف" value={r.check_out || "—"} />

              <div className="text-center mt-3">
                <StatusBadge status={r.status} />
              </div>
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
    </div>
  );
}

/* Helpers */

const StatusBadge = ({ status }) => {
  const map = {
    present: { label: "حاضر", class: "bg-green-100 text-green-700" },
    absent: { label: "غائب", class: "bg-red-100 text-red-700" },
    late: { label: "متأخر", class: "bg-yellow-100 text-yellow-700" },
  };

  const s = map[status] || {
    label: status || "—",
    class: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`px-3 py-1 rounded-xl text-xs ${s.class}`}>{s.label}</span>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm mb-1">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
