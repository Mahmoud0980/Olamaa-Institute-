"use client";
import { useState } from "react";
import Image from "next/image";
import { List, ChevronLeft, Upload, Printer } from "lucide-react";
import useStudents from "./hooks/useStudents";
import StudentsTable from "./components/StudentsTable";
import { ChevronDown } from "lucide-react";
import { useGetBatchesQuery } from "@/store/services/batchesApi";
import StudentsPageSkeleton from "./components/StudentsPageSkeleton";
import AddStudentModal from "./components/addStudent/AddStudentModal";

export default function StudentsPage() {
  const [showTable, setShowTable] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("شباب علمي");
  const { students, isLoading } = useStudents();
  const [selectAll, setSelectAll] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: batchesData } = useGetBatchesQuery();
  if (isLoading) {
    return <StudentsPageSkeleton />;
  }
  return (
    <div
      dir="rtl"
      className="w-full h-full p-6 flex flex-col items-center justify-start"
    >
      {/* القسم العلوي */}
      <div className="w-full flex flex-col items-start text-right mt-6">
        {/* العنوان */}
        <h1 className="text-lg font-semibold text-gray-700 mb-1">استمارة</h1>

        {/* النص المتغير */}
        {!showTable ? (
          <p className="text-gray-500 text-sm mb-3">
            اضغط على الأزرار لبدء بملء الاستمارة
          </p>
        ) : (
          <div className="flex items-center text-sm text-gray-500 gap-1 mb-3">
            <span
              onClick={() => setShowTable(false)}
              className="cursor-pointer hover:underline text-black font-semibold"
            >
              استمارة
            </span>
            <ChevronLeft size={16} className="text-gray-400" />
            <span className="text-black font-semibold">عرض الطلاب</span>
          </div>
        )}

        {/* ✅ صف التحكم الكامل (يمين = الأزرار الثلاثة / يسار = الدورة + طباعة + إكسل) */}
        <div className="flex justify-between items-center w-full flex-wrap gap-3">
          {/* الأزرار الثلاثة */}
          <div className="flex flex-row items-center gap-2">
            {/* إضافة استمارة */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#F9E8F0] text-[#6F013F] px-4 py-1 rounded-md text-sm flex items-center gap-2 hover:bg-[#f4d3e3] transition cursor-pointer"
            >
              <span>+</span> إضافة استمارة
            </button>

            {/* تحديد الكل */}
            <label className="flex items-center gap-1 bg-[#F5ECF7] text-gray-700 border border-gray-200 px-4 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                className="accent-[#6F013F]"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
              />
              تحديد الكل
            </label>

            {/* عرض الطلاب */}
            <button
              onClick={() => setShowTable(true)}
              className="bg-[#E5F5E9] text-[#2F8F46] px-4 py-1 rounded-md text-sm flex items-center gap-2 hover:bg-[#D8F0DE] transition cursor-pointer"
            >
              <List size={16} />
              عرض الطلاب
            </button>
          </div>

          {/* الدورة + طباعة + إكسل */}
          {showTable && (
            <div className="flex flex-col gap-3">
              {/* الدورة */}
              <div className="flex items-center gap-2 relative">
                <span className="text-gray-600 text-sm">الدورة:</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="border w-[220px] border-gray-300 shadow rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none"
                >
                  <option value="">اختر الشعبة</option>
                  {batchesData?.data?.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 justify-end">
                {/* زر الطباعة */}
                <button className="border border-black rounded-md px-3 py-1 text-sm flex items-center gap-1 hover:bg-gray-50 transition">
                  <Printer size={16} />
                  طباعة
                </button>

                {/* زر إكسل */}
                <button className="border border-black rounded-md px-3 py-1 text-sm flex items-center gap-1 hover:bg-gray-50 transition">
                  <Upload size={16} />
                  إكسل
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* المحتوى المتغير */}
      {!showTable ? (
        // الحالة الأولى: الصورة
        <div className="flex flex-col items-center justify-center mt-16">
          <div className="relative w-[280px] h-[280px]">
            <Image
              src="/icons/Frame.png"
              alt="Students Circle"
              fill
              priority
              loading="eager"
              quality={85}
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 280px"
              className="object-contain opacity-95 will-change-transform"
              fetchPriority="high"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-gradient-to-l from-[#D40078] to-[#6D003E] text-white px-6 py-1 rounded-md text-sm cursor-pointer transition flex items-center gap-2"
          >
            <span>+</span> إضافة طالب
          </button>
        </div>
      ) : (
        // الحالة الثانية: الجدول
        <div className="w-full space-y-6 mt-10">
          <StudentsTable
            students={students}
            isLoading={isLoading}
            selectAll={selectAll}
            setSelectAll={setSelectAll}
          />
        </div>
      )}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
