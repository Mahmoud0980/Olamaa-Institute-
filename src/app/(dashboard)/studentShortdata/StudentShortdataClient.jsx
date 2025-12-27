"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import StudentShortdataPage from "./StudentShortdataPage";

export default function StudentShortdataClient() {
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setStudentId(id);
  }, [searchParams]);

  // ننتظر لحين وصول الـ id من QR
  if (!studentId) {
    return (
      <div className="p-10 text-center text-gray-500">
        جاري تحميل بيانات الطالب...
      </div>
    );
  }

  return <StudentShortdataPage idFromUrl={studentId} />;
}
