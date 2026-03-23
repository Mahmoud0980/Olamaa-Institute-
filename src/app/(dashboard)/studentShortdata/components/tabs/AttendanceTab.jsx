"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { notify } from "@/lib/helpers/toastify";
import { useGetAttendanceLogQuery } from "@/store/services/studentAttendanceApi";
import DataTable from "@/components/common/DataTable";
import PrintExportActions from "@/components/common/PrintExportActions";

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

const getRowId = (r) => {
  if (r?.id != null) return String(r.id);
  if (r?.uuid) return String(r.uuid);
  if (r?.record_id != null) return String(r.record_id);
  if (r?.created_at) return `${r.date}-${r.created_at}`;
  return `${r?.date || "no-date"}`;
};

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

  const filteredRecords = useMemo(() => {
    if (!attendanceRange?.start || !attendanceRange?.end) return records;
    return records.filter((r) =>
      inRange(r.date, attendanceRange.start, attendanceRange.end),
    );
  }, [records, attendanceRange]);

  const [selectedIds, setSelectedIds] = useState([]);

  // نحافظ على منطق التعديل لسجل واحد، ولكن نسمح بتحديد الكل للطباعة
  const onSelectChange = (ids) => {
    setSelectedIds(ids);
  };

  const selectedRecord = useMemo(() => {
    if (selectedIds.length === 0) return null;
    // التعديل يتطلب اختيار سجل واحد فقط (الأخير تم اختياره)
    const id = selectedIds[selectedIds.length - 1];
    return filteredRecords.find(r => getRowId(r) === id);
  }, [selectedIds, filteredRecords]);

  const prevTriggerRef = useRef(editTrigger);

  useEffect(() => {
    if (prevTriggerRef.current === editTrigger) return;
    prevTriggerRef.current = editTrigger;

    if (!editTrigger) return;

    if (!selectedRecord) {
      notify.error("يرجى تحديد سجل حضور/غياب لتعديله");
      return;
    }

    if (selectedIds.length > 1) {
      notify.warn("سيتم تعديل السجل المختار الأخير فقط");
    }

    onEditRequest?.({
      ...selectedRecord,
      student_id: student?.id,
    });
  }, [editTrigger, selectedRecord, onEditRequest, student?.id, selectedIds]);

  const columns = useMemo(() => [
    { 
      header: "التاريخ", 
      key: "date" 
    },
    { 
      header: "الوصول", 
      key: "check_in" 
    },
    { 
      header: "الانصراف", 
      key: "check_out" 
    },
    { 
      header: "الحالة", 
      key: "status", 
      className: "text-center",
      render: (val) => <StatusBadge status={val} /> 
    },
  ], []);

  const exportColumns = useMemo(() => [
    { header: "التاريخ", key: "date" },
    { header: "الوصول", key: "check_in" },
    { header: "الانصراف", key: "check_out" },
    { 
      header: "الحالة", 
      key: "status",
      render: (val) => (val === "present" ? "حاضر" : val === "absent" ? "غائب" : val === "late" ? "متأخر" : val || "-")
    },
  ], []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start">
        <PrintExportActions 
          data={filteredRecords}
          selectedIds={selectedIds}
          columns={exportColumns}
          title={`سجل حضور الطالب: ${student?.full_name || "-"}`}
          filename={`حضور_${student?.full_name || "طالب"}`}
        />
      </div>
      <DataTable
        data={filteredRecords}
        columns={columns}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={onSelectChange}
        getRowId={getRowId}
        pageSize={6}
        emptyMessage="لا يوجد بيانات حضور ضمن هذا المجال."
      />
    </div>
  );
}
