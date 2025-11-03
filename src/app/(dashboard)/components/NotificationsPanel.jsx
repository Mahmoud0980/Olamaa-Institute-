"use client";
import Image from "next/image";
import { useState } from "react";

export default function NotificationsPanel() {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "رغبة التسجيل",
      text: "يريد محمد الاستفسار عن طلب حجز دفعة جديدة للأكاديمية لهذا الشهر.",
      status: "قيد الانتظار",
      boint: "/blueBoint.svg",
      time: "2:30pm",

      date: "1 Aug 2025",
      avatars: ["/avt.svg"],
    },
    {
      id: 2,
      title: "تأكيد استلام",
      text: "وصلت رغبة الاستفادة من حسم جديد، يرجى المتابعة وإعلام صاحب الطلب.",
      status: "فشرت",
      time: "2:30pm",
      boint: "/redBoint.svg",
      date: "1 Aug 2025",
      avatars: ["/avt1.svg"],
    },
  ]);

  const removeOne = (id) => setItems((arr) => arr.filter((x) => x.id !== id));
  const removeAll = () => setItems([]);

  return (
    <section
      dir="rtl"
      className="w-full bg-[#FBFBFB] mt-8 p-4 shadow-lg rounded-lg"
    >
      {/* رأس اللوحة */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-gray-900">الإشعارات</h3>
        <a className="text-xs text-[#7B0046] cursor-pointer">عرض المزيد</a>
      </div>

      {/* البطاقات */}
      <div className="space-y-3 ">
        {items.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-gray-400 p-3 shadow-sm bg-transparent  my-4"
          >
            <div className="flex gap-3">
              <div className="flex -space-x-3 rtl:space-x-reverse shrink-0">
                {n.avatars.slice(0, 2).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] leading-5 text-gray-600 line-clamp-2">
                  {n.text}
                </p>
                <div className="mt-2">
                  <Image
                    src={n.boint}
                    alt=""
                    width={12}
                    height={12}
                    className="inline-block ml-1 mb-0.5"
                  />
                  <span>{n.status}</span>
                </div>
              </div>
            </div>
            <hr className="mt-4 mb-2" />
            {/* الوقت + أزرار */}
            <div className="mt-2 flex flex-col justify-between">
              <div className="flex flex-row justify-between items-center gap-2 text-[11px] text-gray-500">
                <span className=" flex text-[12px] px-2 py-1">
                  <Image
                    src={"/calendar.svg"}
                    width={15}
                    height={15}
                    alt="calendar"
                    className="ml-2"
                  />
                  {n.date}
                </span>
                <span className="text-[12px] px-2 py-1">{n.time}</span>
              </div>

              <div className="flex justify-between items-center gap-1 mt-2">
                <button
                  onClick={() => removeOne(n.id)}
                  className="rounded-md bg-gradient-to-l from-[#D40078] to-[#6D003E] px-5 text-white cursor-pointer"
                  title="قبول"
                >
                  قبول
                </button>
                <button
                  onClick={() => removeOne(n.id)}
                  className="border border-[#7B0046] text-[#7B0046] cursor-pointer px-6 sm:px-2 rounded-md"
                  title="رفض"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
            لا توجد إشعارات حالياً
          </div>
        )}
      </div>

      {/* زر رفض الكل */}
      <button
        onClick={removeAll}
        className="mt-3 w-full rounded-xl bg-gradient-to-l from-[#D40078] to-[#6D003E] py-2 text-sm font-semibold text-white hover:opacity-90"
      >
        رفض الكل
      </button>
    </section>
  );
}
