"use client";
import { useRef, useState, useMemo } from "react";
import Image from "next/image";

import {
  useGetTotalGuardiansQuery,
  useGetTotalEmployeesQuery,
  useGetTotalStudentsQuery,
} from "@/store/services/statisticsApi";

export default function HighlightCards() {
  const [active, setActive] = useState(0);
  const resetTimerRef = useRef(null);

  // 🔗 API calls
  const { data: totalGuardians = 0 } = useGetTotalGuardiansQuery();
  const { data: totalEmployees = 0 } = useGetTotalEmployeesQuery();
  const { data: studentsData } = useGetTotalStudentsQuery();

  const totalStudents = studentsData?.total ?? 0;

  // 🧠 الكروت (dynamic)
  const CARDS = useMemo(
    () => [
      {
        title: "عدد الطلاب الكلي",
        subtitle: "إجمالي عدد الطلاب",
        value: totalStudents,
        img: "/totalStudents.svg",
      },
      {
        title: "أولياء الأمور",
        subtitle: "عدد أولياء الأمور المسجلين على التطبيق",
        value: totalGuardians,
        img: "/parents.svg",
      },
      {
        title: "الموظفون الإداريون",
        subtitle: "عدد الموظفين الإداريين في الأكاديمية",
        value: totalEmployees,
        img: "/admins.svg",
      },
      {
        title: "الطلاب المستفيدون من الحسم",
        subtitle: "عدد المستفيدين في الأكاديمية",
        value: 0, // لاحقًا API
        img: "/discounted.svg",
      },
    ],
    [totalStudents, totalGuardians, totalEmployees]
  );

  const clearResetTimer = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  const scheduleResetToDefault = () => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setActive(0);
      resetTimerRef.current = null;
    }, 100);
  };

  const baseCard =
    "group relative w-full md:w-[261px] h-[127px] rounded-2xl shadow-md overflow-hidden " +
    "flex flex-row items-center justify-between p-4 " +
    "transition-transform duration-200 hover:-translate-y-[2px] hover:shadow";

  const activeCard =
    "bg-gradient-to-br from-[#6D003E] to-[#D40078] text-white shadow-lg";
  const plainCard =
    "bg-[#FFF8FC] text-gray-900 border border-gray-200 shadow-md";

  return (
    <div dir="rtl" className="w-full p-4 sm:p-6">
      <div
        className="
        grid gap-6 justify-around mx-auto
        [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]
        md:[grid-template-columns:repeat(auto-fit,minmax(261px,261px))]
      "
      >
        {CARDS.map((c, i) => {
          const isActive = active === i;
          return (
            <div
              key={i}
              onMouseEnter={() => {
                clearResetTimer();
                setActive(i);
              }}
              onMouseLeave={scheduleResetToDefault}
              className={`${baseCard} ${isActive ? activeCard : plainCard}`}
            >
              {isActive && (
                <Image
                  src="/icons/Group13.png"
                  width={36}
                  height={36}
                  alt="star"
                  className="absolute bottom-2 right-0 opacity-0 animate-fadeIn"
                />
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 text-right">
                <div className="text-sm font-semibold">{c.title}</div>
                <div className="text-xs opacity-80">{c.subtitle}</div>
              </div>

              <div className="ms-3 flex flex-col items-start justify-center gap-2">
                <div className="relative h-6 w-11 shrink-0">
                  <Image
                    src={c.img}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-contain"
                    priority={i === 0}
                  />
                </div>
                <div className="text-2xl font-bold">
                  {Number(c.value || 0).toLocaleString("en-US")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
