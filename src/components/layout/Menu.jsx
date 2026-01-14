"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
export default function Menu() {
  const [openMenu, setOpenMenu] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setUserRoles(parsed?.user?.roles || []);
      } catch {
        setUserRoles([]);
      }
    }
  }, []);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const hasAccess = (allowedRoles = []) => {
    if (allowedRoles.length === 0) return true;
    return allowedRoles.some((role) => userRoles.includes(role));
  };

  const handleLogout = async () => {
    try {
      const auth = localStorage.getItem("auth");
      const token = auth ? JSON.parse(auth)?.token : null;

      await fetch("http://abd990-001-site1.qtempurl.com/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem("auth");
      localStorage.removeItem("currentUser");
      router.replace("/login");
    }
  };

  const menuItems = [
    {
      title: "الصفحة الرئيسية",
      icon: "/icons/ChartLine.svg",
      href: "/",
      roles: ["admin", "accountant", "employee"],
    },
    {
      title: "الجداول الرئيسية",
      icon: "/icons/CirclesFour.svg",
      roles: ["admin", "accountant"],
      sub: [
        {
          name: "سجلات الحضور والغياب ",
          href: "/attendance",
          roles: ["admin", "accountant"],
        },

        { name: "المدن", href: "/cities", roles: ["admin", "accountant"] },
        { name: "الباصات", href: "/buses", roles: ["admin"] },
        {
          name: "السجلات الاكاديمية",
          href: "/academicBranches",
          roles: ["admin"],
        },

        { name: "المواد", href: "/subjects", roles: ["admin"] },
        { name: "طرق المعرفة بنا", href: "/knowWays", roles: ["admin"] },
        { name: "القاعات الدراسية", href: "/classRooms", roles: ["admin"] },
        { name: "المدارس", href: "/schools", roles: ["admin"] },
      ],
    },

    {
      title: "المدرسون",
      icon: "/icons/UsersThree.svg",
      roles: ["admin"],
      sub: [
        { name: "قائمة المدرسين", href: "/teachers", roles: ["admin"] },
        {
          name: "إضافة مدرس",
          href: "/teachers?addTeacher=1",
          roles: ["admin"],
        },
      ],
    },
    {
      title: "الموظفون",
      icon: "/icons/HeadCircuit.svg",
      roles: ["admin"],
      sub: [
        { name: "قائمة الموظفين", href: "/employees", roles: ["admin"] },
        {
          name: "إضافة موظف",
          href: "/employees?addEmployee=1",
          roles: ["admin"],
        },
      ],
    },
    {
      title: "الطلاب",
      icon: "/icons/Student.svg",
      roles: ["admin", "employee"],
      sub: [
        {
          name: "قائمة الطلاب",
          href: "/students",
          roles: ["admin", "employee"],
        },
        // { name: "إضافة طالب", href: "/students?add=1", roles: ["admin"] },
      ],
    },
    {
      title: "المذاكرات",
      icon: "/icons/EyeSlash.svg",
      roles: ["admin", "employee"],
      sub: [
        {
          name: "قائمة المذاكرات",
          href: "/notes",
          roles: ["admin", "employee"],
        },
        { name: "إضافة مذاكرة", href: "/notes/add", roles: ["admin"] },
      ],
    },
    {
      title: "الدفعات",
      icon: "/icons/HandCoins.svg",
      roles: ["admin", "accountant"],
      sub: [
        {
          name: "عرض الدفعات",
          href: "/payments",
          roles: ["admin", "accountant"],
        },
        { name: "إضافة دفعة", href: "/payments/add", roles: ["admin"] },
      ],
    },
    {
      title: "الدورات",
      icon: "/icons/Export.svg",
      roles: ["admin"],
      sub: [
        { name: "قائمة الدورات", href: "/batches", roles: ["admin"] },
        // { name: "إضافة دورة", href: "/courses/add", roles: ["admin"] },
      ],
    },
    {
      title: "التقارير",
      icon: "/icons/ChartBar.svg",
      roles: ["admin", "accountant"],
      sub: [
        { name: "تقارير الطلاب", href: "/reports/students", roles: ["admin"] },
        {
          name: "تقارير الموظفين",
          href: "/reports/employees",
          roles: ["admin", "accountant"],
        },
      ],
    },
    {
      title: "لوحة التحكم",
      icon: "/icons/ChartBar.svg",
      roles: ["admin", "accountant"],
      sub: [
        { name: "أفرع المعهد", href: "/instituteBranches", roles: ["admin"] },
        {
          name: "السجلات",
          href: "",
          roles: ["admin", "accountant"],
        },
        {
          name: "الإعدادات",
          href: "",
          roles: ["admin", "accountant"],
        },
      ],
    },
  ];

  return (
    <div className="w-full h-full text-right font-medium px-2 flex flex-col overflow-hidden">
      {/* العناصر */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-1 pr-1 overscroll-contain text-[14px]">
        {menuItems
          .filter((menu) => hasAccess(menu.roles))
          .map((menu) => {
            const isOpen = openMenu === menu.title;

            return (
              <div key={menu.title} className="mb-1">
                {menu.sub ? (
                  <button
                    onClick={() => toggleMenu(menu.title)}
                    className="cursor-pointer group flex items-center justify-between w-full rounded-lg
                               px-2.5 py-2 text-[#4D4D4D]
                               hover:bg-[#AD164C] hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={menu.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="object-contain transition group-hover:brightness-0 group-hover:invert"
                      />
                      <span className="leading-5">{menu.title}</span>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      } group-hover:text-white`}
                    />
                  </button>
                ) : (
                  <Link
                    href={menu.href}
                    className="group flex items-center w-full rounded-lg
                               px-2.5 py-2 text-[#4D4D4D]
                               hover:bg-[#AD164C] hover:text-white transition"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={menu.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="object-contain transition group-hover:brightness-0 group-hover:invert"
                      />
                      <span className="leading-5">{menu.title}</span>
                    </div>
                  </Link>
                )}

                {menu.sub && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "max-h-screen opacity-100 mt-1"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="space-y-1">
                      {menu.sub
                        .filter((item) => hasAccess(item.roles))
                        .map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className="block px-2.5 py-1.5 rounded-md text-[13px]
                                         hover:bg-[#F7CBE3] hover:font-semibold hover:text-black transition"
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
      </div>

      {/* الفوتر */}
      <div className="shrink-0 pt-2">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 w-full text-right text-[#7B0046]
                 hover:bg-[#AD164C] hover:text-white
                 rounded-lg px-2.5 py-2 transition text-[14px]"
        >
          <Image
            src="/icons/SignOut.svg"
            alt="logout"
            width={20}
            height={20}
            className="transition group-hover:brightness-0 group-hover:invert"
          />
          <span className="leading-5">تسجيل الخروج</span>
        </button>

        {/* الصورة أصغر شوي */}
        <div className="relative mt-2 h-[170px] w-[84%] mx-auto rounded-xl overflow-hidden">
          <Image
            src="/icons/sidebar-footer.png"
            alt="sidebar footer"
            fill
            sizes="(max-width: 768px) 200px, 300px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
