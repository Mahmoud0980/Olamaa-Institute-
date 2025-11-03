"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // ← عرض الـ PNG
import { ChevronDown, ChevronUp } from "lucide-react";

const role = "admin";

const menuItems = [
  {
    title: "الجداول الأساسية",
    iconSrc: "/menu.svg", // ← ضع ملفك هنا داخل public/icons/
    items: [
      { label: "الصفوف", href: "/classes", visible: ["admin", "teacher"] },
      { label: "المواد", href: "/subjects", visible: ["admin", "teacher"] },
      { label: "القاعات", href: "/rooms", visible: ["admin", "teacher"] },
      {
        label: "حالات الغياب والحضور",
        href: "/attendance",
        visible: ["admin", "teacher"],
      },
      { label: "المدن", href: "/cities", visible: ["admin"] },
      { label: "المدارس", href: "/cities", visible: ["admin"] },
      { label: "انواع الدورات", href: "/cities", visible: ["admin"] },
      { label: "انواع الامتحانات", href: "/cities", visible: ["admin"] },
      { label: "نماذج الرسائل", href: "/cities", visible: ["admin"] },
      { label: "باصات المعهد", href: "/cities", visible: ["admin"] },
    ],
  },
  {
    title: "1الجداول الأساسية",
    iconSrc: "/menu.svg", // ← ضع ملفك هنا داخل public/icons/
    items: [
      { label: "الصفوف", href: "/classes", visible: ["admin", "teacher"] },
      { label: "المواد", href: "/subjects", visible: ["admin", "teacher"] },
      { label: "القاعات", href: "/rooms", visible: ["admin", "teacher"] },
      {
        label: "حالات الغياب والحضور",
        href: "/attendance",
        visible: ["admin", "teacher"],
      },
      { label: "المدن", href: "/cities", visible: ["admin"] },
      { label: "المدارس", href: "/cities", visible: ["admin"] },
      { label: "انواع الدورات", href: "/cities", visible: ["admin"] },
      { label: "انواع الامتحانات", href: "/cities", visible: ["admin"] },
      { label: "نماذج الرسائل", href: "/cities", visible: ["admin"] },
      { label: "باصات المعهد", href: "/cities", visible: ["admin"] },
    ],
  },
];

export default function Menu() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <div className="w-full text-right">
      {menuItems.map((group) => (
        <div key={group.title} className="mb-4">
          {/* الزر الرئيسي */}
          <button
            onClick={() => toggleMenu(group.title)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-white font-semibold bg-[#AD164C] shadow-md transition-all duration-300 hover:opacity-90"
          >
            {/* أيقونة PNG قبل النص (يمينًا في RTL) */}
            <div className="flex items-center gap-2 flex-row">
              {group.iconSrc ? (
                <Image
                  src={group.iconSrc}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain shrink-0"
                  priority
                  quality={80}
                />
              ) : null}
              <span>{group.title}</span>
            </div>

            {/* سهم الفتح/الإغلاق */}
            {openMenu === group.title ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {/* القائمة الفرعية مع الخطوط */}
          {openMenu === group.title && (
            <div className="relative mt-2 pr-4">
              <div className="absolute right-5 top-0 bottom-0 w-[2px] bg-[#5E5E5E]" />
              <div className="flex flex-col gap-2 mr-[12px]">
                {group.items.map((item) =>
                  item.visible.includes(role) ? (
                    <div
                      key={item.label}
                      className="relative flex items-center"
                    >
                      <div className="relative flex items-center w-52">
                        <span className="absolute -right-2 top-1/2 w-3 h-5 border-r-[2px] border-t-[2px] border-[#5E5E5E] rounded-tr-lg origin-right -scale-y-100 pointer-events-none" />
                        <Link
                          href={item.href}
                          className="relative top-4 right-0 z-10 ml-2 w-full text-[#5E5E5E] px-4 py-2 rounded-md hover:bg-[#F7CBE3] hover:shadow-[0_0_18px_-10px_rgba(0,0,0,0.4)] transition-all duration-200 cursor-pointer"
                        >
                          {item.label}
                        </Link>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
