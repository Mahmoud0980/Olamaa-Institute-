// import { Suspense } from "react";
// import StudentShortdataClient from "./StudentShortdataClient";

// export default function Page() {
//   return (
//     <Suspense
//       fallback={
//         <div className="p-10 text-center text-gray-500">
//           جاري تحميل بيانات الطالب...
//         </div>
//       }
//     >
//       <StudentShortdataClient />
//     </Suspense>
//   );
// }
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import useStudentData from "./hooks/useStudentData";

import StudentCard from "./components/StudentCard";
import StudentInfoTab from "./components/tabs/StudentInfoTab";
import AttendanceTab from "./components/tabs/AttendanceTab";
import PaymentsTab from "./components/tabs/PaymentsTab";
import EditAttendanceModal from "./components/EditAttendanceModal";
import StudentShortdataSkeleton from "./components/StudentShortdataSkeleton";

import ExcelButton from "@/components/common/ExcelButton";
import PrintButton from "@/components/common/PrintButton";

// RTK
import { useGetAttendanceLogQuery } from "@/store/services/studentAttendanceApi";
import { useGetStudentPaymentsSummaryQuery } from "@/store/services/studentPaymentsApi";

export default function StudentShortdataPage() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");

  const { student, loading, error } = useStudentData(idFromUrl);

  const [activeTab, setActiveTab] = useState("info");

  // ✅ Range لكل تبويب (حتى ما يتأثروا ببعض)
  const [attendanceRange, setAttendanceRange] = useState({
    start: null,
    end: null,
  });
  const [paymentsRange, setPaymentsRange] = useState({
    start: null,
    end: null,
  });

  // تعديل الحضور
  const [openEdit, setOpenEdit] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [editTrigger, setEditTrigger] = useState(0);

  // ===== Attendance (للاكسل/الطباعة) =====
  const { data: attendanceRecords = [] } = useGetAttendanceLogQuery(
    { id: idFromUrl, range: "all" },
    { skip: !idFromUrl }
  );

  // ===== Payments (للاكسل/الطباعة) =====
  const { data: paymentsData } = useGetStudentPaymentsSummaryQuery(idFromUrl, {
    skip: !idFromUrl,
  });

  const payments = paymentsData?.payments || paymentsData?.data?.payments || [];

  if (!idFromUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center p-10 text-gray-500">
        لا يوجد معرف طالب في الرابط.
      </div>
    );
  }

  if (loading) return <StudentShortdataSkeleton />;

  if (error || !student) {
    return (
      <div className="w-full h-full flex items-center justify-center p-10 text-red-500">
        لم يتم العثور على بيانات الطالب.
      </div>
    );
  }

  // ✅ تحديث range حسب التبويب الحالي
  const handleRangeChange = ({ tab, range }) => {
    if (tab === "payments") setPaymentsRange(range);
    else setAttendanceRange(range);
  };

  // ================= Excel =================
  const handleExcel = () => {
    const wb = XLSX.utils.book_new();

    const studentSheet = XLSX.utils.json_to_sheet([
      {
        "الاسم الكامل": student.full_name,
        الجنس: student.gender,
        الهاتف: student.phone || "",
        الفرع: student.branch?.name || "",
        الحالة: student.status?.name || "",
      },
    ]);
    XLSX.utils.book_append_sheet(wb, studentSheet, "معلومات الطالب");

    const attendanceSheet = XLSX.utils.json_to_sheet(
      attendanceRecords.map((r) => ({
        التاريخ: r.date,
        الوصول: r.check_in || "",
        الانصراف: r.check_out || "",
        الحالة: r.status,
      }))
    );
    XLSX.utils.book_append_sheet(wb, attendanceSheet, "الحضور والغياب");

    const paymentsSheet = XLSX.utils.json_to_sheet(
      payments.map((p) => ({
        التاريخ: p.payment_date,
        "رقم الإيصال": p.receipt_number,
        المبلغ: p.amount_usd,
      }))
    );
    XLSX.utils.book_append_sheet(wb, paymentsSheet, "الدفعات");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `student_${student.id}.xlsx`
    );
  };

  // ================= Print (HTML) =================
  const handlePrint = () => {
    let html = "";

    if (activeTab === "info") {
      html = `
        <html dir="rtl">
          <head>
            <style>
              body { font-family: Arial; padding:20px }
              table { width:100%; border-collapse: collapse; }
              td { padding:8px; border:1px solid #ccc }
            </style>
          </head>
          <body>
            <h3>معلومات الطالب</h3>
            <table>
              <tr><td>الاسم الكامل</td><td>${student.full_name}</td></tr>
              <tr><td>الجنس</td><td>${student.gender}</td></tr>
              <tr><td>الهاتف</td><td>${student.phone || ""}</td></tr>
              <tr><td>الفرع</td><td>${student.branch?.name || ""}</td></tr>
              <tr><td>الحالة</td><td>${student.status?.name || ""}</td></tr>
            </table>
          </body>
        </html>
      `;
    }

    if (activeTab === "attendance") {
      html = `
        <html dir="rtl">
          <head>
            <style>
              body { font-family: Arial; padding:20px }
              table { width:100%; border-collapse: collapse; }
              th, td { border:1px solid #ccc; padding:6px; font-size:12px }
              th { background:#f3f3f3 }
            </style>
          </head>
          <body>
            <h3>سجل الحضور والغياب</h3>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصول</th>
                  <th>الانصراف</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                ${attendanceRecords
                  .map(
                    (r) => `
                  <tr>
                    <td>${r.date}</td>
                    <td>${r.check_in || "—"}</td>
                    <td>${r.check_out || "—"}</td>
                    <td>${r.status}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
    }

    if (activeTab === "payments") {
      html = `
        <html dir="rtl">
          <head>
            <style>
              body { font-family: Arial; padding:20px }
              table { width:100%; border-collapse: collapse; }
              th, td { border:1px solid #ccc; padding:6px; font-size:12px }
            </style>
          </head>
          <body>
            <h3>الدفعات</h3>
            <table>
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>رقم الإيصال</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                ${payments
                  .map(
                    (p) => `
                  <tr>
                    <td>${p.payment_date}</td>
                    <td>${p.receipt_number}</td>
                    <td>${p.amount_usd}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;
    }

    const win = window.open("", "", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const handleEditAttendanceClick = () => {
    if (activeTab !== "attendance") {
      toast.error("يرجى الانتقال إلى تبويب الغياب والحضور للتعديل");
      return;
    }
    setEditTrigger((v) => v + 1);
  };

  return (
    <div dir="rtl" className="p-4 md:p-6 bg-[#FBFBFB]">
      <div className="flex flex-col lg:flex-row-reverse gap-6">
        <div className="lg:w-1/4">
          <StudentCard
            student={student}
            selectedDate={null}
            onDateChange={() => {}}
            activeTab={activeTab}
            attendanceRange={attendanceRange}
            paymentsRange={paymentsRange}
            onRangeChange={handleRangeChange}
            onEditAttendance={handleEditAttendanceClick}
          />
        </div>

        <div className="lg:w-3/4 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-6 overflow-x-auto">
              <TabButton
                active={activeTab === "info"}
                onClick={() => setActiveTab("info")}
              >
                معلومات شخصية
              </TabButton>
              <TabButton
                active={activeTab === "attendance"}
                onClick={() => setActiveTab("attendance")}
              >
                الغياب والحضور
              </TabButton>
              <TabButton
                active={activeTab === "payments"}
                onClick={() => setActiveTab("payments")}
              >
                الدفعات
              </TabButton>
            </div>

            <div className="flex gap-2 self-end md:self-auto">
              <ExcelButton onClick={handleExcel} />
              <PrintButton onClick={handlePrint} />
            </div>
          </div>

          {/* Content */}
          {activeTab === "info" && <StudentInfoTab student={student} />}

          {activeTab === "attendance" && (
            <AttendanceTab
              student={student}
              attendanceRange={attendanceRange}
              editTrigger={editTrigger}
              onEditRequest={(record) => {
                setRecordToEdit(record);
                setOpenEdit(true);
              }}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsTab student={student} paymentsRange={paymentsRange} />
          )}
        </div>
      </div>

      <EditAttendanceModal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        record={recordToEdit}
        onSave={() => setOpenEdit(false)}
      />
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 border-b-2 transition text-sm ${
        active
          ? "border-black text-black"
          : "border-transparent text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
