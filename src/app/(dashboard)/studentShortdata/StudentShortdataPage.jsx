"use client";

import { useState } from "react";
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

export default function StudentShortdataPage({ idFromUrl }) {
  // ===== Data =====
  const { student, loading, error } = useStudentData(idFromUrl);

  const { data: attendanceRecords = [] } = useGetAttendanceLogQuery(
    { id: idFromUrl, range: "all" },
    { skip: !idFromUrl }
  );

  const { data: paymentsData } = useGetStudentPaymentsSummaryQuery(idFromUrl, {
    skip: !idFromUrl,
  });

  const payments = paymentsData?.payments || paymentsData?.data?.payments || [];

  // ===== UI =====
  const [activeTab, setActiveTab] = useState("info");
  const [selectedDate, setSelectedDate] = useState(null);

  // ===== Edit attendance =====
  const [openEdit, setOpenEdit] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [editTrigger, setEditTrigger] = useState(0);

  if (loading) return <StudentShortdataSkeleton />;

  if (error || !student) {
    return (
      <div className="p-10 text-center text-red-500">
        لم يتم العثور على بيانات الطالب.
      </div>
    );
  }

  // ===== Excel =====
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
    XLSX.utils.book_append_sheet(wb, attendanceSheet, "الحضور");

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

  return (
    <div dir="rtl" className="p-4 md:p-6 bg-[#FBFBFB]">
      <div className="flex flex-col lg:flex-row-reverse gap-6">
        <div className="lg:w-1/4">
          <StudentCard
            student={student}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEditAttendance={() => setEditTrigger((v) => v + 1)}
          />
        </div>

        <div className="lg:w-3/4 flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="flex gap-6">
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

            <div className="flex gap-2">
              <ExcelButton onClick={handleExcel} />
              <PrintButton />
            </div>
          </div>

          {activeTab === "info" && <StudentInfoTab student={student} />}

          {activeTab === "attendance" && (
            <AttendanceTab
              student={student}
              selectedDate={selectedDate}
              editTrigger={editTrigger}
              onEditRequest={(record) => {
                setRecordToEdit(record);
                setOpenEdit(true);
              }}
            />
          )}

          {activeTab === "payments" && <PaymentsTab student={student} />}
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
      className={`pb-2 border-b-2 text-sm transition ${
        active
          ? "border-black text-black"
          : "border-transparent text-gray-400 hover:text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
