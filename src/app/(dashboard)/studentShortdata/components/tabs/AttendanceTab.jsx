"use client";

import { useMemo, useState, useEffect } from "react";
import { useGetAttendanceLogQuery } from "@/store/services/studentAttendanceApi";
import EditAttendanceModal from "../EditAttendanceModal";
import toast from "react-hot-toast";

export default function AttendanceTab({
  student,
  selectedDate,
  editTrigger, // 🔑 إشارة من زر التعديل
}) {
  const { data: records = [], isLoading } = useGetAttendanceLogQuery({
    id: student.id,
    range: "all",
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ================= فلترة حسب التاريخ =================
  const filteredRecords = useMemo(() => {
    if (!selectedDate) return [];

    const selected = selectedDate.toLocaleDateString("en-CA");
    return records.filter((r) => r.date === selected);
  }, [records, selectedDate]);

  // ================= الاستجابة لزر التعديل =================
  useEffect(() => {
    if (!editTrigger) return;

    if (!selectedDate) {
      // (احتياط، رغم أن StudentCard يعالجها)
      toast.error("يرجى اختيار تاريخ أولاً");
      return;
    }

    if (filteredRecords.length === 0) {
      toast.error("لا يوجد سجل حضور في هذا التاريخ");
      return;
    }

    if (filteredRecords.length > 1) {
      toast.error("يوجد أكثر من سجل في هذا اليوم");
      return;
    }

    // ✅ سجل واحد
    setSelectedRecord(filteredRecords[0]);
    setOpenEdit(true);
  }, [editTrigger]); // نراقب فقط الضغط

  if (isLoading)
    return (
      <p className="text-center text-sm text-gray-500 py-6">
        جاري تحميل بيانات الحضور...
      </p>
    );

  if (!filteredRecords.length && selectedDate)
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
        لا يوجد سجل حضور في هذا التاريخ.
      </div>
    );

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50">
              <th className="p-3 rounded-r-xl">التاريخ</th>
              <th className="p-3">الوصول</th>
              <th className="p-3">الانصراف</th>
              <th className="p-3 rounded-l-xl text-center">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => (
              <tr key={i} className="hover:bg-pink-50">
                <td className="p-3 rounded-r-xl">{r.date}</td>
                <td className="p-3">{r.check_in || "—"}</td>
                <td className="p-3">{r.check_out || "—"}</td>
                <td className="p-3 rounded-l-xl text-center">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {filteredRecords.map((r, i) => (
          <div key={i} className="border rounded-xl p-4 shadow-sm bg-white">
            <Row label="التاريخ" value={r.date} />
            <Row label="الوصول" value={r.check_in || "—"} />
            <Row label="الانصراف" value={r.check_out || "—"} />
            <div className="text-center mt-3">
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <EditAttendanceModal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        record={{
          ...selectedRecord,
          student_id: student.id,
        }}
        onSave={() => setOpenEdit(false)}
      />
    </div>
  );
}

/* ================= Helpers ================= */

const StatusBadge = ({ status }) => {
  const map = {
    present: { label: "حاضر", class: "bg-green-100 text-green-700" },
    absent: { label: "غائب", class: "bg-red-100 text-red-700" },
    late: { label: "متأخر", class: "bg-yellow-100 text-yellow-700" },
  };

  const s = map[status] || {
    label: status,
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
