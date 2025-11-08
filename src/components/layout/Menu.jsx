"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function Menu() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const menuItems = [
    {
      title: "الصفحة الرئيسية",
      icon: "/icons/ChartLine.svg",
      href: "/",
    },
    {
      title: "الجداول الرئيسية",
      icon: "/icons/CirclesFour.svg",
      sub: [
        { name: "الصفوف", href: "/classes" },
        { name: "المواد", href: "/subjects" },
        { name: "القاعات", href: "/rooms" },
      ],
    },
    {
      title: "الدفعات",
      icon: "/icons/HandCoins.svg",
      sub: [
        { name: "عرض الدفعات", href: "/payments" },
        { name: "إضافة دفعة", href: "/payments/add" },
      ],
    },
    {
      title: "المدرسون",
      icon: "/icons/UsersThree.svg",
      sub: [
        { name: "قائمة المدرسين", href: "/teachers" },
        { name: "إضافة مدرس", href: "/teachers/add" },
      ],
    },
    {
      title: "الموظفون",
      icon: "/icons/HeadCircuit.svg",
      sub: [
        { name: "قائمة الموظفين", href: "/employees" },
        { name: "إضافة موظف", href: "/employees/add" },
      ],
    },
    {
      title: "الطلاب",
      icon: "/icons/Student.svg",
      sub: [
        { name: "قائمة الطلاب", href: "/students" },
        { name: "إضافة طالب", href: "/students/add" },
      ],
    },
    {
      title: "المذاكرات",
      icon: "/icons/EyeSlash.svg",
      sub: [
        { name: "قائمة المذاكرات", href: "/notes" },
        { name: "إضافة مذاكرة", href: "/notes/add" },
      ],
    },
    {
      title: "الدورات",
      icon: "/icons/Export.svg",
      sub: [
        { name: "قائمة الدورات", href: "/courses" },
        { name: "إضافة دورة", href: "/courses/add" },
      ],
    },
    {
      title: "التقارير",
      icon: "/icons/ChartBar.svg",
      sub: [
        { name: "تقارير الطلاب", href: "/reports/students" },
        { name: "تقارير الموظفين", href: "/reports/employees" },
      ],
    },
  ];

  return (
    <div className="w-full text-right font-medium mt-4 px-3">
      {menuItems.map((menu) => {
        const isOpen = openMenu === menu.title;

        return (
          <div key={menu.title} className="mb-1">
            {/* الزر الرئيسي */}
            <button
              onClick={() => toggleMenu(menu.title)}
              className="group flex items-center justify-between w-full rounded-lg px-3 py-2 text-[#4D4D4D] hover:bg-[#AD164C] hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={menu.icon}
                  alt=""
                  width={22}
                  height={22}
                  className="object-contain transition group-hover:brightness-0 group-hover:invert"
                />
                <span>{menu.title}</span>
              </div>
              {menu.sub && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  } group-hover:text-white`}
                />
              )}
            </button>

            {/* القوائم الفرعية */}
            {menu.sub && (
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                }`}
              >
                <ul className="">
                  {menu.sub.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="block px-2 py-1 rounded-md hover:bg-[#F7CBE3] hover:font-semibold hover:text-black transition"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* زر تسجيل الخروج */}
      <Link
        href="/logout"
        className="group flex items-center gap-2 text-[#7B0046] hover:bg-[#AD164C] hover:text-white rounded-lg px-3 py-2 mt-12 transition"
      >
        <Image
          src="/icons/SignOut.svg"
          alt="logout"
          width={20}
          height={20}
          className="transition group-hover:brightness-0 group-hover:invert"
        />
        <span>تسجيل الخروج</span>
      </Link>
    </div>
  );
}
