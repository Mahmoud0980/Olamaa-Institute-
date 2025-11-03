"use client";
import { useRef, useState } from "react";
import Image from "next/image";

const CARDS = [
  {
    title: "عدد الطلاب الكلي",
    subtitle: "إجمالي عدد الطلاب",
    value: 4000,
    img: "/totalStudents.svg",
  },
  {
    title: "أولياء الأمور",
    subtitle: "عدد أولياء الأمور المسجلين على التطبيق",
    value: 4000,
    img: "/parents.svg",
  },
  {
    title: "الموظفون الإداريون",
    subtitle: "عدد الموظفين الإداريين في الأكاديمية",
    value: 4000,
    img: "/admins.svg",
  },
  {
    title: "الطلاب المستفيدون من الحسم",
    subtitle: "عدد المستفيدين في الأكاديمية",
    value: 4000,
    img: "/discounted.svg",
  },
];

export default function HighlightCards() {
  const [active, setActive] = useState(0);
  const resetTimerRef = useRef(null);

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

  // نفس التخطيط بكل المقاسات: صف واحد، تمركز عمودي، ارتفاع ثابت
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
      {/* تحت md مرن عمود واحد، من md وفوق أعمدة 261px */}
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
              {/* <Image
                src={"/star.svg"}
                width={30}
                height={30}
                alt="star"
                className="absolute "
              /> */}
              {/* النص (يمين) */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 text-right">
                <div
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : "text-gray-900"
                  }`}
                  title={c.title}
                >
                  {c.title}
                </div>
                <div
                  className={`text-xs ${
                    isActive ? "text-white/85" : "text-gray-600"
                  }`}
                  title={c.subtitle}
                >
                  {c.subtitle}
                </div>
              </div>

              {/* الأيقونة + القيمة (يسار) */}
              <div className="ms-3 flex flex-col items-start justify-center gap-2">
                <div className="relative h-6 w-11 shrink-0">
                  <Image
                    src={c.img}
                    alt=""
                    fill
                    sizes="44px"
                    className={`object-contain transition ${
                      isActive ? "invert brightness-0" : ""
                    }`}
                    priority={i === 0}
                  />
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isActive ? "text-white" : "text-gray-800"
                  }`}
                >
                  {c.value.toLocaleString("en-US")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
