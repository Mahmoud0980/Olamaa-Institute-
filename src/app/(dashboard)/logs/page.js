"use client";

import { useMemo, useState } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import DataTable from "@/components/common/DataTable";
import { useGetLogsQuery } from "@/store/services/logsApi";
import dayjs from "dayjs";

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

  const columns = useMemo(
    () => [
      {
        header: "الوقت",
        key: "created_at",
        render: (val) => (
          <div className="text-gray-500 whitespace-nowrap text-xs">
            {dayjs(val).format("HH:mm  YYYY-MM-DD")}
          </div>
        ),
      },
      {
        header: "المستخدم",
        key: "user_name",
        render: (val) => (
          <span className="font-semibold text-gray-800">{val || "—"}</span>
        ),
      },
      {
        header: "نوع العملية",
        key: "event",
        render: (val) => {
          const labels = { created: "إضافة", updated: "تعديل", deleted: "حذف" };
          const colors = {
            created: "bg-blue-100 text-blue-700 border-blue-200",
            updated: "bg-green-100 text-green-700 border-green-200",
            deleted: "bg-red-100 text-red-700 border-red-200",
          };
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] border ${
                colors[val] || colors.updated
              }`}
            >
              {labels[val] || val}
            </span>
          );
        },
      },
      {
        header: "العنصر",
        key: "auditable_type",
        render: (val, row) => {
          const parts = (val || "").split("\\");
          const model = parts[parts.length - 1] || val || "—";
          return (
            <div className="text-[12px]">
              {model}{" "}
              <span className="text-gray-400">(ID: {row.auditable_id})</span>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <LogsSkeleton count={7} />;
  if (isError)
    return (
      <div className="p-2 space-y-1">
        <Breadcrumb />
        <h1 className="text-2xl font-bold">سجل العمليات</h1>
        <div className="p-4 rounded-xl bg-white">
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

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">سجل العمليات</h1>
          <div className="text-sm text-gray-500 mt-1">
            إجمالي السجلات:{" "}
            <span className="text-gray-700 font-medium">{logs.length}</span>
          </div>
        </div>
        <FiltersBar
          eventValue={eventFilter}
          onEventChange={(v) => {
            setEventFilter(v);
            setPage(1);
          }}
          eventOptions={eventOptions}
          userValue={userFilter}
          onUserChange={(v) => {
            setUserFilter(v);
            setPage(1);
          }}
          userOptions={usersOptions}
        />
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        isLoading={isLoading}
        showCheckbox={false}
        pageSize={perPage}
        currentPage={page}
        onPageChange={setPage}
        emptyMessage="لا يوجد سجلات وفق الفلترة الحالية"
        mobileRender={(row) => <TimelineItem log={row} />}
      />
    </div>
  );
}
