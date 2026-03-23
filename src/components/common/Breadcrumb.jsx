"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const menuItems = [
  {
    title: "الصفحة الرئيسية",
    href: "/",
  },
  {
    title: "الجداول الرئيسية",
    sub: [
      { name: "سجلات الحضور والغياب", href: "/attendance" },
      { name: "المدن", href: "/cities" },
      { name: "الباصات", href: "/buses" },
      { name: "السجلات الاكاديمية", href: "/academicBranches" },
      { name: "المواد", href: "/subjects" },
      { name: "طرق المعرفة بنا", href: "/knowWays" },
      { name: "القاعات الدراسية", href: "/classRooms" },
      { name: "نماذج الرسائل", href: "/message-templates" },
      { name: "المدارس", href: "/schools" },
    ],
  },
  {
    title: "المدرسون",
    sub: [
      { name: "قائمة المدرسين", href: "/teachers" },
      { name: "إضافة مدرس", href: "/teachers?addTeacher=1" },
    ],
  },
  {
    title: "الموظفون",
    sub: [
      { name: "قائمة الموظفين", href: "/employees" },
      { name: "إضافة موظف", href: "/employees?addEmployee=1" },
    ],
  },
  {
    title: "الطلاب",
    sub: [
      { name: "قائمة الطلاب", href: "/students" },
      { name: "إضافة طالب", href: "/students?add=1" },
    ],
  },
  {
    title: "العائلات وأولياء الأمور",
    sub: [
      { name: "قائمة العائلات", href: "/families" },
      { name: "أولياء الأمور", href: "/guardians" },
    ],
  },
  {
    title: "المذاكرات",
    sub: [
      { name: "قائمة المذاكرات", href: "/exams" },
      { name: "إضافة مذاكرة", href: "/exams/add" },
    ],
  },
  {
    title: "الدفعات",
    sub: [
      { name: "عرض الدفعات", href: "/payments" },
      { name: "إضافة دفعة", href: "/payments/add" },
    ],
  },
  {
    title: "الدورات",
    sub: [{ name: "قائمة الدورات", href: "/batches" }],
  },
  {
    title: "التقارير",
    sub: [
      { name: "تقارير الطلاب", href: "/reports/students" },
      { name: "تقارير الموظفين", href: "/reports/employees" },
    ],
  },
  {
    title: "لوحة التحكم",
    sub: [
      { name: "أفرع المعهد", href: "/instituteBranches" },
      { name: "السجلات", href: "/logs" },
      { name: "الإعدادات", href: "/settings" },
      { name: "الطلبات", href: "/requests" },
    ],
  },
];

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
  requests: "الطلبات",
  logs: "سجل العمليات",
  exams: "الامتحانات",
  families: "العائلات",
  guardians: "أولياء الأمور",
  setting:"الاعدادات"
};

function BreadcrumbContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/") return null;

  let bestMatch = null;
  let maxScore = -1;

  for (const group of menuItems) {
    if (group.sub) {
      for (const item of group.sub) {
        if (!item.href) continue;
        const [itemPath, itemQuery] = item.href.split("?");

        let score = -1;

        if (pathname === itemPath) {
          score = 10;
        } else if (pathname.startsWith(itemPath + "/")) {
          score = 5;
        }

        if (score > 0) {
          if (itemQuery) {
            const urlParams = new URLSearchParams(itemQuery);
            let allQueryMatch = true;
            for (const [key, val] of urlParams.entries()) {
              if (searchParams.get(key) !== val) {
                allQueryMatch = false;
                break;
              }
            }
            if (allQueryMatch) {
              score += 10;
            } else {
              score = -1;
            }
          }

          if (score > maxScore) {
            maxScore = score;
            bestMatch = { parentTitle: group.title, currentTitle: item.name };
          }
        }
      }
    }
  }

  if (!bestMatch) {
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    const current = dictionary[last] || last;

    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-gray-700 font-medium">{current}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="text-gray-500">{bestMatch.parentTitle}</span>
      <span className="text-gray-400">›</span>
      <span className="text-gray-700 font-medium">{bestMatch.currentTitle}</span>
    </div>
  );
}

export default function Breadcrumb() {
  return (
    <Suspense fallback={<div className="h-5"></div>}>
      <BreadcrumbContent />
    </Suspense>
  );
}
