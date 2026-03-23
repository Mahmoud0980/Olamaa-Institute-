"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import SearchableSelect from "@/components/common/SearchableSelect";
import ActionsRow from "@/components/common/ActionsRow";
import DataTable from "@/components/common/DataTable";
import { ArrowRight, BookOpenText } from "lucide-react";

import StudentSubjectsView from "../components/StudentSubjectsView";

const MOCK_STUDENTS = [
  {
    id: 1,
    first_name: "آلاء",
    last_name: "فتال",
    full_name: "آلاء فتال",
    email: "alaa@gmail.com",
    phone: "0987654321",
    batch_name: "علمي بنات",
    registration_date: "2/3/2025",
    start_date: "2/3/2025",
    completion_rate: "24%",
    notes: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    subjects_count: 7,
    profile_photo_url: null,
  },
  {
    id: 2,
    first_name: "سنا",
    last_name: "فرع",
    full_name: "سنا فرع",
    email: "sana@gmail.com",
    phone: "099999999",
    batch_name: "علمي بنات",
    registration_date: "3/3/2025",
    start_date: "3/3/2025",
    completion_rate: "20%",
    notes: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    subjects_count: 6,
    profile_photo_url: null,
  },
  {
    id: 3,
    first_name: "روان",
    last_name: "قضيماني",
    full_name: "روان قضيماني",
    email: "rawan@gmail.com",
    phone: "0911111111",
    batch_name: "علمي بنات",
    registration_date: "4/3/2025",
    start_date: "4/3/2025",
    completion_rate: "10%",
    notes: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    subjects_count: 5,
    profile_photo_url: null,
  },
  {
    id: 4,
    first_name: "رين",
    last_name: "أعمى",
    full_name: "رين أعمى",
    email: "reen@gmail.com",
    phone: "0922222222",
    batch_name: "علمي بنات",
    registration_date: "5/3/2025",
    start_date: "5/3/2025",
    completion_rate: "20%",
    notes: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    subjects_count: 7,
    profile_photo_url: null,
  },
  {
    id: 5,
    first_name: "رماح",
    last_name: "زكي",
    full_name: "رماح زكي",
    email: "ramah@gmail.com",
    phone: "0933333333",
    batch_name: "علمي بنات",
    registration_date: "6/3/2025",
    start_date: "6/3/2025",
    completion_rate: "22%",
    notes: "سيتم بدء دوام الشعبة في بداية الشهر 9",
    subjects_count: 5,
    profile_photo_url: null,
  },
];

export default function BatchStudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchName = searchParams.get("batch") || "علمي بنات";
  const initialView = searchParams.get("view");

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [activeStudent, setActiveStudent] = useState(null);

  // Initialize view from search param if subjects was requested
  useState(() => {
    if (initialView === "subjects" && MOCK_STUDENTS.length > 0) {
      setActiveStudent(MOCK_STUDENTS[0]);
    }
  });

  const studentOptions = useMemo(
    () => [
      { value: "", label: "كل الطلاب" },
      ...MOCK_STUDENTS.map((s) => ({
        value: String(s.id),
        label: s.full_name,
      })),
    ],
    [],
  );

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((student) => {
      const sameBatch = !batchName || student.batch_name === batchName;
      const sameStudent =
        !selectedStudentId || String(student.id) === String(selectedStudentId);
      return sameBatch && sameStudent;
    });
  }, [batchName, selectedStudentId]);

  const columns = [
    { header: "الطالب", key: "first_name" },
    { header: "الكنية", key: "last_name" },
    { header: "بدء الدوام", key: "start_date" },
    { header: "تاريخ التسجيل", key: "registration_date" },
    { header: "نسبة التقدم", key: "completion_rate" },
    { header: "المواد", key: "subjects_count" },
  ];

  /* If activeStudent is selected, show details component */
  if (activeStudent) {
    return (
      <StudentSubjectsView
        student={activeStudent}
        batch={{ name: batchName }}
        onBack={() => setActiveStudent(null)}
      />
    );
  }

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen p-4 md:p-6 bg-[#fcfcfd] flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-800">
            طلاب الدورة: {batchName}
          </h1>
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-4">
          <SearchableSelect
            label="اسم الطالب"
            value={selectedStudentId}
            onChange={setSelectedStudentId}
            options={studentOptions}
            allowClear
            placeholder="اختر الطالب"
          />
          {/* <button
            onClick={() => router.back()}
            className="h-[40px] px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
          >
            <ArrowRight size={16} />
            <span>رجوع</span>
          </button> */}
        </div>
      </div>

      {/* Stats/Actions */}
      <ActionsRow
        viewLabel=""
        addLabel=""
        onAdd={() => {}}
        showSelectAll={true}
      />

      {/* Main Table using DataTable component */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        pageSize={10}
        onRowClick={(row) => setActiveStudent(row)}
      />
    </div>
  );
}
