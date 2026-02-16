"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// قاموس لترجمة الروابط العربية
const dictionary = {
  subjects: "المواد",
  cities: "المدن",
  batches: "الشعب",
  buses: "الباصات",
  academicBranches: "السجلات الأكاديمية",
  instituteBranches: "افرع المعهد",
  teachers: "المدرسون",
  employees: "الموظفون",
  students: "الطلاب",
  notes: "المذاكرات",
  courses: "الدورات",
  payments: "الدفعات",
  reports: "التقارير",
  knowWays: "طرق المعرفة بنا",
  classRooms: "القاعات الدراسية",
  attendance: "سجلات الحضور والغياب",
  schools: "المدارس",
  requests: " الطلبات",
};

export default function Breadcrumb() {
  const pathname = usePathname(); // مثال: "/subjects"

  // إزالة "/" وتقسيم المسار
  const parts = pathname.split("/").filter(Boolean); // ["subjects"]

  // نأخذ آخر جزء لأنه يمثل اسم الصفحة
  const last = parts[parts.length - 1] || "";

  // ترجمة الجزء للعربية من القاموس
  const current = dictionary[last] || last;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link href="/" className="hover:underline">
        الجداول الرئيسية
      </Link>

      <span className="text-gray-400">›</span>

      <span className="text-gray-700 font-medium">{current}</span>
    </div>
  );
}
