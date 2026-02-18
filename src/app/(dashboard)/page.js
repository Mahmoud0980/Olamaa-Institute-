"use client";

import { useEffect, useState } from "react";

// ===== Components =====
import UserCard from "./components/UserCard";
import BestCourseChart from "./components/BestCourseChart";
import WeeklyCalendarCard from "./components/WeeklyCalendarCard";
import BatchesCards from "./components/Batches";
import NotificationsPanel from "./components/NotificationsPanel";
import AttendanceCard from "./components/AttendanceCard";
import CountChart from "./components/CountChart";
import BadgeCluster from "./components/BadgeCluster";
import ExamCard from "./components/ExamCard";
import DashboardSkeleton from "../../components/feedback/DashboardSkeleton.jsx";

export default function Page() {
  // خليها true بالبداية حتى ما يصير فلاش للمحتوى
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skeleton بسيط وهادئ (اختياري)
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="bg-white min-h-dvh overflow-auto" dir="rtl">
      <UserCard />

      <div className="container mx-auto p-4 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 flex flex-col gap-4 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm">
                  <BestCourseChart />
                </div>

                <div className="rounded-2xl bg-[#AD164C] shadow-sm md:h-[175px]">
                  <ExamCard />
                </div>
              </div>

              <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm">
                <CountChart />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm">
                <AttendanceCard value={80} />
              </div>

              <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm lg:col-span-2">
                <BadgeCluster />
              </div>
            </div>
          </section>

          <aside className="lg:col-span-1 flex flex-col gap-4 min-w-0">
            <div className="rounded-2xl bg-[#FBFBFB] p-3 shadow-sm">
              <WeeklyCalendarCard />
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <BatchesCards />
              <NotificationsPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
