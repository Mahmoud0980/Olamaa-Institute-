"use client";

import { useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { useGetLogsQuery } from "@/store/services/logsApi";

import FiltersBar from "./components/FiltersBar";
import TimelineItem from "./components/TimelineItem";
import LogsSkeleton from "./components/LogsSkeleton";

export default function LogsPage() {
  const { data, isLoading, isError, refetch } = useGetLogsQuery();

  const logs = data?.data || [];

  const [eventFilter, setEventFilter] = useState(""); // "", "created", "updated", "deleted"
  const [userFilter, setUserFilter] = useState(""); // user_name
  const [page, setPage] = useState(1);

  const perPage = 10;

  const usersOptions = useMemo(() => {
    const names = Array.from(
      new Set(logs.map((l) => l.user_name).filter(Boolean)),
    );
    return [
      { value: "", label: "كل المستخدمين", key: "all-users" },
      ...names.map((n, idx) => ({ value: n, label: n, key: `u-${idx}-${n}` })),
    ];
  }, [logs]);

  const eventOptions = useMemo(
    () => [
      { value: "", label: "كل الأنواع", key: "all-events" },
      { value: "created", label: "إضافة", key: "created" },
      { value: "updated", label: "تعديل", key: "updated" },
      { value: "deleted", label: "حذف", key: "deleted" },
    ],
    [],
  );

  const filteredLogs = useMemo(() => {
    let arr = [...logs];

    if (eventFilter) arr = arr.filter((l) => l.event === eventFilter);
    if (userFilter)
      arr = arr.filter((l) => String(l.user_name) === String(userFilter));

    // الأحدث أولاً
    arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return arr;
  }, [logs, eventFilter, userFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / perPage));

  const pageItems = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;
    return filteredLogs.slice(start, start + perPage);
  }, [filteredLogs, page, totalPages]);

  // إذا تغيّرت الفلاتر → رجّع للصفحة الأولى
  const onChangeEvent = (v) => {
    setEventFilter(v);
    setPage(1);
  };
  const onChangeUser = (v) => {
    setUserFilter(v);
    setPage(1);
  };

  if (isLoading) return <LogsSkeleton count={7} />;
  if (isError)
    return (
      <div className="p-2 space-y-1">
        <Breadcrumb />
        <h1 className="text-2xl font-bold">سجل العمليات</h1>
        <div className="p-4 rounded-xl border bg-white">
          فشل تحميل السجلات
          <button
            className="mr-2 text-pink-700 underline"
            onClick={() => refetch?.()}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-2">
      <Breadcrumb />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">سجل العمليات</h1>
        <FiltersBar
          eventValue={eventFilter}
          onEventChange={onChangeEvent}
          eventOptions={eventOptions}
          userValue={userFilter}
          onUserChange={onChangeUser}
          userOptions={usersOptions}
        />
      </div>
      <div className="text-sm text-gray-500">
        إجمالي السجلات: <span className="text-gray-700">{logs.length}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* الخط */}
        <div className="absolute right-[10px] top-0 bottom-0 w-[2px] bg-gray-100" />

        <div className="space-y-4">
          {pageItems.length === 0 ? (
            <div className="p-5 rounded-xl  bg-white text-gray-600">
              لا يوجد سجلات وفق الفلترة الحالية
            </div>
          ) : (
            pageItems.map((log) => <TimelineItem key={log.id} log={log} />)
          )}
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        hideIfSinglePage
      />
    </div>
  );
}
