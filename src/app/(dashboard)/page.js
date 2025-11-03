"use client";

import React, { useEffect, useState } from "react";
import UserCard from "./components/UserCard";
import BestCourseChart from "./components/BestCourseChart";
import WeeklyCalendarCard from "./components/WeeklyCalendarCard";
import BatchesCards from "./components/Batches";
import NotificationsPanel from "./components/NotificationsPanel";
import AttendanceCard from "./components/AttendanceCard";
import AuthGate from "@/components/common/AuthGate";
import DashboardSkeleton from "../../components/feedback/DashboardSkeleton.jsx";
import CountChart from "./components/CountChart";
import BadgeCluster from "./components/BadgeCluster";
import ExamCard from "./components/ExamCard";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800); // حسّاسيتك
    return () => clearTimeout(t);
  }, []);
  if (isLoading) {
    return (
      <AuthGate>
        <DashboardSkeleton />
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <div className="bg-white min-h-dvh" dir="rtl">
        {/* بطاقة المستخدم أعلى الصفحة */}
        <UserCard />

        {/* حاوية عامة */}
        <div className="container mx-auto p-4 overflow-hidden">
          {/* شبكة عامة: عمود رئيسي + سايدبار */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* ===== اليسار (2/3) ===== */}
            <section className="lg:col-span-2 flex flex-col gap-4 min-w-0">
              {/* الصف العلوي */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
                {/* يسار: بطاقتان فوق بعض */}
                <div className="flex flex-col gap-4 min-w-0">
                  {/* الدونات / أول كارد */}
                  <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm w-full h-auto">
                    <div className="w-full h-auto ">
                      <BestCourseChart heightClass="h-full" />
                    </div>
                  </div>

                  {/* الأعمدة الصغيرة / ثاني كارد */}
                  <div className="rounded-2xl bg-[#AD164C]  shadow-sm w-full h-auto md:h-[175px]">
                    <div className="w-full h-auto sm:h-auto">
                      {/* ضع الميني بار/ويدجت هنا */}
                      <ExamCard />
                    </div>
                  </div>
                </div>

                {/* يمين: بطاقة كبيرة */}
                <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm w-full h-auto">
                  <div className="w-full h-[240px] sm:h-auto lg:h-[378px]">
                    {/* محتوى البطاقة الكبيرة */}
                    <CountChart />
                  </div>
                </div>
              </div>

              {/* الصف السفلي */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
                {/* كارد يسار صغير */}

                <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm w-full h-auto lg:col-span-1">
                  <div className="w-full h-auto">
                    {/* تقويم/ويدجت جانبي (إن حبيت نسخة ثانية) */}
                    <AttendanceCard value={80} />
                  </div>
                </div>

                {/* كارد يمين عريض */}
                <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm w-full h-auto lg:col-span-2">
                  <div className="w-full h-auto">
                    {/* إحصائيات شهرية مثلاً */}
                    <BadgeCluster />
                  </div>
                </div>
              </div>
            </section>

            {/* ===== اليمين (1/3) ===== */}
            <aside className="lg:col-span-1 flex flex-col gap-4 min-w-0">
              <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm w-full h-auto">
                <WeeklyCalendarCard />
              </div>

              <div className="rounded-2xl bg-white p-4 w-full h-auto">
                <BatchesCards />
                <NotificationsPanel />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
