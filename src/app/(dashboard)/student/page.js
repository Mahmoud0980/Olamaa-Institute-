import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudents } from "../../../store/slices/studentsSlice";

const StudentsList = () => {
  const dispatch = useDispatch();
  const { list, status, error } = useSelector((state) => state.students);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  if (status === "loading") return <p>جاري تحميل الطلاب...</p>;
  if (status === "failed") return <p>خطأ: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">قائمة الطلاب</h2>
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">الاسم الكامل</th>
            <th className="p-2 border">الفرع</th>
            <th className="p-2 border">الباص</th>
            <th className="p-2 border">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {list.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="p-2 border">{student.full_name}</td>
              <td className="p-2 border">{student.institute_branch?.name}</td>
              <td className="p-2 border">{student.bus?.bus_number || "—"}</td>
              <td className="p-2 border">{student.status?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsList;
