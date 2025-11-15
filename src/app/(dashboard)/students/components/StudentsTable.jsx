"use client";
import React, { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import Image from "next/image";
import StudentsSkeleton from "./StudentsSkeleton";

export default function StudentsTable({
  students,
  isLoading,
  selectAll,
  setSelectAll,
}) {
  const [selectedStudents, setSelectedStudents] = useState([]);

  // يبقى يُستدعى بكل رندر (ما في returns قبله)
  useEffect(() => {
    if (selectAll) {
      setSelectedStudents((students || []).map((s, i) => s?.id ?? i));
    } else {
      setSelectedStudents([]);
    }
  }, [selectAll, students]);

  const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden overflow-x-auto p-5">
      {/* حالات التحميل / لا يوجد بيانات */}
      {isLoading ? (
        <div className="py-10 text-center text-gray-500">
          {/* <StudentsSkeleton /> */}
          جاري تحميل البيانات
        </div>
      ) : !students?.length ? (
        <div className="py-10 text-center text-gray-400">
          لا يوجد طلاب حالياً.
        </div>
      ) : (
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700 rounded-t-xl">
              <th className="p-3 w-10 text-center rounded-tr-xl">
                <input
                  type="checkbox"
                  checked={!!selectAll}
                  onChange={(e) => setSelectAll?.(e.target.checked)}
                  className="accent-[#6F013F] cursor-pointer"
                />
              </th>
              <th className="p-3">#</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الكنية</th>
              <th className="p-3 text-center rounded-tl-xl">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => {
              const id = student?.id ?? index; // fallback لو مافي id
              const isSelected = selectedStudents.includes(id);
              return (
                <tr
                  key={id}
                  className={`bg-white hover:bg-pink-50 transition ${
                    isSelected ? "bg-pink-100" : ""
                  }`}
                >
                  <td className="p-3 text-center rounded-r-xl">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudent(id)}
                      className="accent-[#6F013F] cursor-pointer"
                    />
                  </td>
                  <td className="p-3 whitespace-nowrap">{index + 1}</td>
                  <td className="p-3 whitespace-nowrap">
                    {student.first_name}
                  </td>
                  <td className="p-3 whitespace-nowrap">{student.last_name}</td>

                  <td className="p-3 whitespace-nowrap text-center rounded-l-xl">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => console.log("حذف الطالب:", id)}
                        className="cursor-pointer"
                        title="حذف"
                      >
                        <Image
                          src={"/icons/Trash.png"}
                          alt="حذف"
                          width={18}
                          height={18}
                          quality={85}
                        />
                      </button>
                      <button
                        onClick={() => console.log("تعديل الطالب:", id)}
                        className="cursor-pointer"
                        title="تعديل"
                      >
                        <Image
                          src={"/icons/Edit.png"}
                          alt="حذف"
                          width={18}
                          height={18}
                          quality={85}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
