"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Pagination from "@/components/common/Pagination";

const statusBadge = (hasUser) =>
    hasUser ? (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            مفعّل
        </span>
    ) : (
        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">
            غير مفعّل
        </span>
    );

export default function FamiliesTable({
    families = [],
    isLoading,
    selectedIds = [],
    onSelectChange,
    onView,
    onEdit,
    onDelete,
    onActivate,
}) {
    const safe = Array.isArray(families) ? families : [];

    const [page, setPage] = useState(1);
    const pageSize = 8;
    const totalPages = Math.ceil(safe.length / pageSize) || 1;
    const paginated = safe.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        if (page !== 1) setPage(1);
    }, [families.length]);

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [page, totalPages]);

    const toggleSelect = (row) => {
        if (!onSelectChange) return;
        const exists = selectedIds.includes(row.id);
        const updated = exists
            ? selectedIds.filter((id) => id !== row.id)
            : [...selectedIds, row.id];
        onSelectChange(updated);
    };

    if (isLoading) {
        return (
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
            {!paginated.length ? (
                <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
            ) : (
                <>
                    {/* DESKTOP TABLE */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-pink-50 text-gray-700">
                                    <th className="p-3 text-center rounded-r-xl">#</th>
                                    <th className="p-3">رقم العائلة</th>
                                    <th className="p-3">حساب المستخدم</th>
                                    <th className="p-3 text-center">عدد الطلاب</th>
                                    <th className="p-3 text-center">عدد أولياء الأمور</th>
                                    <th className="p-3">حالة الحساب</th>
                                    <th className="p-3">تاريخ الإنشاء</th>
                                    <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className="bg-white hover:bg-pink-50 transition"
                                    >
                                        <td className="p-3 text-center rounded-r-xl">
                                            <div className="flex items-center justify-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-[#6F013F]"
                                                    checked={selectedIds.includes(row.id)}
                                                    onChange={() => toggleSelect(row)}
                                                />
                                                <span>{(page - 1) * pageSize + index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 font-medium text-[#6F013F]">
                                            #{row.id}
                                        </td>
                                        <td className="p-3">
                                            {row.user?.name ?? (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                                                {row.students_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                                                {row.guardians_count ?? 0}
                                            </span>
                                        </td>
                                        <td className="p-3">{statusBadge(!!row.user_id)}</td>
                                        <td className="p-3 text-gray-500 text-xs">
                                            {row.created_at?.split(" ")[0] ?? "—"}
                                        </td>
                                        <td className="p-3 rounded-l-xl text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    title="عرض التفاصيل"
                                                    onClick={() => onView?.(row)}
                                                    className="text-blue-600 hover:text-blue-800 transition"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-[18px] h-[18px]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>

                                                {!row.user_id && (
                                                    <button
                                                        title="تفعيل حساب"
                                                        onClick={() => onActivate?.(row)}
                                                        className="text-emerald-600 hover:text-emerald-800 transition"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="w-[18px] h-[18px]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                        </svg>
                                                    </button>
                                                )}

                                                <button onClick={() => onDelete?.(row)}>
                                                    <Image
                                                        src="/icons/Trash.png"
                                                        width={18}
                                                        height={18}
                                                        alt="delete"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="md:hidden space-y-4 mt-4">
                        {paginated.map((row, index) => (
                            <div
                                key={row.id}
                                className="border border-gray-200 rounded-xl p-4 shadow-sm"
                            >
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">#</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                            {(page - 1) * pageSize + index + 1}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-[#6F013F]"
                                            checked={selectedIds.includes(row.id)}
                                            onChange={() => toggleSelect(row)}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">رقم العائلة:</span>
                                    <span className="font-medium text-[#6F013F]">
                                        #{row.id}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">حساب المستخدم:</span>
                                    <span>{row.user?.name ?? "—"}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">عدد الطلاب:</span>
                                    <span>{row.students_count ?? 0}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">أولياء الأمور:</span>
                                    <span>{row.guardians_count ?? 0}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">الحالة:</span>
                                    {statusBadge(!!row.user_id)}
                                </div>
                                <div className="flex justify-center gap-6 mt-3">
                                    <button onClick={() => onView?.(row)}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5 text-blue-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                    {!row.user_id && (
                                        <button onClick={() => onActivate?.(row)}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5 text-emerald-600"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button onClick={() => onDelete?.(row)}>
                                        <Image
                                            src="/icons/Trash.png"
                                            width={20}
                                            height={20}
                                            alt="delete"
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
