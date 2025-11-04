"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

const role = "admin";

const menuItems = [
  {
    title: "الصفحة الرئيسية",
    iconSrc: "/icons/ChartLine.png",
    items: [],
  },
  {
    title: "الجداول الرئيسية",
    iconSrc: "/icons/CirclesFour.png",
    items: [
      { label: "الصفوف", href: "/classes", visible: ["admin", "teacher"] },
      { label: "المواد", href: "/subjects", visible: ["admin", "teacher"] },
      { label: "القاعات", href: "/rooms", visible: ["admin", "teacher"] },
    ],
  },
  {
    title: "الدفعات",
    iconSrc: "/icons/HandCoins.png",
    items: [
      { label: "عرض الدفعات", href: "/payments", visible: ["admin"] },
      { label: "إضافة دفعة", href: "/payments/add", visible: ["admin"] },
    ],
  },
  {
    title: "المدرسون",
    iconSrc: "/icons/UsersThree.png",
    items: [
      { label: "عرض الدفعات", href: "/payments", visible: ["admin"] },
      { label: "إضافة دفعة", href: "/payments/add", visible: ["admin"] },
    ],
  },
  {
    title: "الموظفون",
    iconSrc: "/icons/HeadCircuit.png",
    items: [
      { label: "عرض الدفعات", href: "/payments", visible: ["admin"] },
      { label: "إضافة دفعة", href: "/payments/add", visible: ["admin"] },
    ],
  },
  {
    title: "الطلاب",
    iconSrc: "/icons/Student.png",
    items: [
      { label: "عرض الدفعات", href: "/payments", visible: ["admin"] },
      { label: "إضافة دفعة", href: "/payments/add", visible: ["admin"] },
    ],
  },
  {
    title: "المذاكرات",
    iconSrc: "/icons/EyeSlash.png",
    items: [
      { label: "عرض الدفعات", href: "/payments", visible: ["admin"] },
      { label: "إضافة دفعة", href: "/payments/add", visible: ["admin"] },
    ],
  },
  {
    title: "الدورات",
    iconSrc: "/icons/Export.png",
    items: [
      { label: "عرض الدفعات", href: "/payments", visible: ["admin"] },
      { label: "إضافة دفعة", href: "/payments/add", visible: ["admin"] },
    ],
  },
  {
    title: "التقارير",
    iconSrc: "/icons/ChartBar.png",
    items: [
      { label: "تقارير الطلاب", href: "/reports/students", visible: ["admin"] },
      {
        label: "تقارير الموظفين",
        href: "/reports/employees",
        visible: ["admin"],
      },
    ],
  },
];

export default function Menu() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <div className="w-full flex flex-col text-right font-medium">
      {/* ====== العنوان العلوي ====== */}

      {/* ====== القوائم ====== */}
      <nav className="mt-4 flex flex-col gap-1 px-3">
        {menuItems.map((group) => (
          <div key={group.title} className="mb-1">
            <button
              onClick={() => toggleMenu(group.title)}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-[#4D4D4D] hover:bg-[#F2D9E6] transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                {group.iconSrc && (
                  <Image
                    src={group.iconSrc}
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                )}
                <span className="text-[20px]">{group.title}</span>
              </div>
              {group.items?.length > 0 &&
                (openMenu === group.title ? (
                  <ChevronUp className="w-4 h-4 text-[#4D4D4D]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#4D4D4D]" />
                ))}
            </button>

            {openMenu === group.title && group.items?.length > 0 && (
              <div className="pl-4 pr-6 py-2 flex flex-col gap-1 border-r-2 border-[#B7699D]">
                {group.items.map(
                  (item) =>
                    item.visible.includes(role) && (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-[#4D4D4D] text-[14px] hover:text-[#A5164C] hover:font-semibold transition-all duration-150"
                      >
                        {item.label}
                      </Link>
                    )
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ====== زر تسجيل الخروج ====== */}
      <div className="mt-6 px-3 py-4">
        <Link
          href="/logout"
          className="flex items-center gap-2 text-[#7B0046] hover:opacity-80 transition"
        >
          <Image
            src="/icons/SignOut.png"
            alt=""
            width={20}
            height={20}
            className="object-contain"
          />
          <span>تسجيل الخروج</span>
        </Link>
      </div>
    </div>
  );
}
