"use client";

import DataTable from "@/components/common/DataTable";
import PrintExportActions from "@/components/common/PrintExportActions";
import StudentInfoCard from "./StudentInfoCard";
import Breadcrumb from "@/components/common/Breadcrumb";

const MOCK_SUBJECTS = [
  { id: 1, subject_name: "رياضيات", course_name: "بكالوريا علمي" },
  { id: 2, subject_name: "جغرافيا", course_name: "بكالوريا أدبي" },
  { id: 3, subject_name: "عربي", course_name: "تاسع" },
  { id: 4, subject_name: "فيزياء", course_name: "بكالوريا علمي" },
  { id: 5, subject_name: "تاريخ", course_name: "بكالوريا أدبي" },
  { id: 6, subject_name: "كيمياء", course_name: "تاسع" },
  { id: 7, subject_name: "ديانة", course_name: "تاسع" },
  { id: 8, subject_name: "عربي", course_name: "تاسع" },
  { id: 9, subject_name: "رياضيات", course_name: "تاسع" },
  { id: 10, subject_name: "فيزياء", course_name: "تاسع" },
];

export default function StudentSubjectsView({ student, batch, onBack }) {
  const columns = [
    { header: "المادة", key: "subject_name" },
    { header: "الدورة", key: "course_name" },
  ];

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen p-4 md:p-6 bg-[#fcfcfd] space-y-6"
    >
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-800">مواد الطالب</h1>
          <Breadcrumb />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PrintExportActions
            data={MOCK_SUBJECTS}
            selectedIds={[]}
            columns={[
              { header: "#", key: "id" },
              { header: "المادة", key: "subject_name" },
              { header: "الدورة", key: "course_name" },
            ]}
            title="مواد الطالب"
            filename="مواد-الطالب"
          />

          {/* <button
            type="button"
            onClick={onBack}
            className="h-[38px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            رجوع
          </button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-9 rounded-2xl overflow-hidden">
          <DataTable
            data={MOCK_SUBJECTS}
            columns={columns}
            pageSize={10}
            showCheckbox={false}
          />
        </div>
        <div className="xl:col-span-3">
          <StudentInfoCard
            student={{
              ...student,
              batch_name: batch?.name || student?.batch_name || "—",
              registration_date: student?.registration_date || "23/4/2025",
              subjects_count: MOCK_SUBJECTS.length,
            }}
          />
        </div>
      </div>
    </div>
  );
}
