// "use client";

// import { useMemo, useState, useEffect } from "react";
// import { useGetAttendanceLogQuery } from "@/store/services/studentAttendanceApi";
// import EditAttendanceModal from "../EditAttendanceModal";
// import toast from "react-hot-toast";

// export default function AttendanceTab({
//   student,
//   selectedDate,
//   editTrigger, // 🔑 إشارة من زر التعديل
// }) {
//   const { data: records = [], isLoading } = useGetAttendanceLogQuery({
//     id: student.id,
//     range: "all",
//   });

//   const [openEdit, setOpenEdit] = useState(false);
//   const [selectedRecord, setSelectedRecord] = useState(null);

//   // ================= فلترة حسب التاريخ =================
//   const filteredRecords = useMemo(() => {
//     if (!selectedDate) return [];

//     const selected = selectedDate.toLocaleDateString("en-CA");
//     return records.filter((r) => r.date === selected);
//   }, [records, selectedDate]);

//   // ================= الاستجابة لزر التعديل =================
//   useEffect(() => {
//     if (!editTrigger) return;

//     if (!selectedDate) {
//       // (احتياط، رغم أن StudentCard يعالجها)
//       toast.error("يرجى اختيار تاريخ أولاً");
//       return;
//     }

//     if (filteredRecords.length === 0) {
//       toast.error("لا يوجد سجل حضور في هذا التاريخ");
//       return;
//     }

//     if (filteredRecords.length > 1) {
//       toast.error("يوجد أكثر من سجل في هذا اليوم");
//       return;
//     }

//     // ✅ سجل واحد
//     setSelectedRecord(filteredRecords[0]);
//     setOpenEdit(true);
//   }, [editTrigger]); // نراقب فقط الضغط

//   if (isLoading)
//     return (
//       <p className="text-center text-sm text-gray-500 py-6">
//         جاري تحميل بيانات الحضور...
//       </p>
//     );

//   if (!filteredRecords.length && selectedDate)
//     return (
//       <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
//         لا يوجد سجل حضور في هذا التاريخ.
//       </div>
//     );

//   return (
//     <div className="bg-white rounded-2xl p-4 md:p-6">
//       {/* Desktop */}
//       <div className="hidden md:block overflow-x-auto">
//         <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
//           <thead>
//             <tr className="bg-pink-50">
//               <th className="p-3 rounded-r-xl">التاريخ</th>
//               <th className="p-3">الوصول</th>
//               <th className="p-3">الانصراف</th>
//               <th className="p-3 rounded-l-xl text-center">الحالة</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredRecords.map((r, i) => (
//               <tr key={i} className="hover:bg-pink-50">
//                 <td className="p-3 rounded-r-xl">{r.date}</td>
//                 <td className="p-3">{r.check_in || "—"}</td>
//                 <td className="p-3">{r.check_out || "—"}</td>
//                 <td className="p-3 rounded-l-xl text-center">
//                   <StatusBadge status={r.status} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Mobile */}
//       <div className="md:hidden space-y-3">
//         {filteredRecords.map((r, i) => (
//           <div key={i} className="border rounded-xl p-4 shadow-sm bg-white">
//             <Row label="التاريخ" value={r.date} />
//             <Row label="الوصول" value={r.check_in || "—"} />
//             <Row label="الانصراف" value={r.check_out || "—"} />
//             <div className="text-center mt-3">
//               <StatusBadge status={r.status} />
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Modal */}
//       <EditAttendanceModal
//         isOpen={openEdit}
//         onClose={() => setOpenEdit(false)}
//         record={{
//           ...selectedRecord,
//           student_id: student.id,
//         }}
//         onSave={() => setOpenEdit(false)}
//       />
//     </div>
//   );
// }

// /* ================= Helpers ================= */

// const StatusBadge = ({ status }) => {
//   const map = {
//     present: { label: "حاضر", class: "bg-green-100 text-green-700" },
//     absent: { label: "غائب", class: "bg-red-100 text-red-700" },
//     late: { label: "متأخر", class: "bg-yellow-100 text-yellow-700" },
//   };

//   const s = map[status] || {
//     label: status,
//     class: "bg-gray-100 text-gray-700",
//   };

//   return (
//     <span className={`px-3 py-1 rounded-xl text-xs ${s.class}`}>{s.label}</span>
//   );
// };

// const Row = ({ label, value }) => (
//   <div className="flex justify-between text-sm mb-1">
//     <span className="text-gray-500">{label}</span>
//     <span className="font-medium">{value}</span>
//   </div>
// );
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useGetAttendanceLogQuery } from "@/store/services/studentAttendanceApi";

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

export default function AttendanceTab({
  student,
  attendanceRange, // ✅ بدل selectedDate
  editTrigger,
  onEditRequest,
}) {
  const { data: records = [], isLoading } = useGetAttendanceLogQuery({
    id: student.id,
    range: "all",
  });

  // ✅ فلترة حسب Range (إذا موجود)
  const filteredRecords = useMemo(() => {
    if (!attendanceRange?.start || !attendanceRange?.end) return records;
    return records.filter((r) =>
      inRange(r.date, attendanceRange.start, attendanceRange.end)
    );
  }, [records, attendanceRange]);

  // ✅ اختيار سطر واحد
  const [selectedKey, setSelectedKey] = useState(null);

  const selectedRecord = useMemo(() => {
    if (!selectedKey) return null;
    return (
      filteredRecords.find(
        (r) =>
          `${r.date}|${r.check_in || ""}|${r.check_out || ""}|${
            r.status || ""
          }` === selectedKey
      ) || null
    );
  }, [selectedKey, filteredRecords]);

  const toggleSelect = (r) => {
    const key = `${r.date}|${r.check_in || ""}|${r.check_out || ""}|${
      r.status || ""
    }`;
    setSelectedKey((prev) => (prev === key ? null : key));
  };

  // ✅ مهم: ما بدنا يشتغل على mount لما نرجع من تبويب لتبويب
  const prevTriggerRef = useRef(editTrigger);

  useEffect(() => {
    // إذا ما تغيّر فعلياً => لا تعمل شي
    if (prevTriggerRef.current === editTrigger) return;
    prevTriggerRef.current = editTrigger;

    if (!editTrigger) return;

    if (!selectedRecord) {
      toast.error("يرجى تحديد سجل حضور/غياب لتعديله");
      return;
    }

    onEditRequest?.({
      ...selectedRecord,
      student_id: student.id,
    });
  }, [editTrigger, selectedRecord, onEditRequest, student.id]);

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
              <th className="p-3 rounded-r-xl w-10 text-center">✓</th>
              <th className="p-3">التاريخ</th>
              <th className="p-3">الوصول</th>
              <th className="p-3">الانصراف</th>
              <th className="p-3 rounded-l-xl text-center">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => {
              const key = `${r.date}|${r.check_in || ""}|${r.check_out || ""}|${
                r.status || ""
              }`;
              const checked = selectedKey === key;

              return (
                <tr key={i} className="hover:bg-pink-50">
                  <td className="p-3 rounded-r-xl text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(r)}
                      className="w-4 h-4 accent-[#6F013F]"
                    />
                  </td>
                  <td className="p-3">{r.date}</td>
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
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {filteredRecords.map((r, i) => {
          const key = `${r.date}|${r.check_in || ""}|${r.check_out || ""}|${
            r.status || ""
          }`;
          const checked = selectedKey === key;

          return (
            <div key={i} className="rounded-xl p-4 shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">تحديد</div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelect(r)}
                  className="w-4 h-4 accent-[#6F013F]"
                />
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
