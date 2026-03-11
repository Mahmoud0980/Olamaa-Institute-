"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination";

const relationshipLabel = (r) => {
    const map = {
        father: "أب",
        mother: "أم",
        legal_guardian: "ولي أمر قانوني",
        other: "أخرى",
    };
    return map[r] || r || "—";
};

export default function GuardiansTable({
    guardians = [],
    isLoading,
    selectedIds = [],
    onSelectChange,
    onView,
    onEdit,
    onDelete,
}) {
    const safe = Array.isArray(guardians) ? guardians : [];

    const [page, setPage] = useState(1);
    const pageSize = 8;
    const totalPages = Math.ceil(safe.length / pageSize) || 1;
    const paginated = safe.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        if (page !== 1) setPage(1);
    }, [guardians.length]);

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
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-pink-50 text-gray-700">
                                    <th className="p-3 text-center rounded-r-xl">#</th>
                                    <th className="p-3">اسم ولي الأمر</th>
                                    <th className="p-3">رقم العائلة</th>
                                    <th className="p-3">العلاقة</th>
                                    <th className="p-3 text-center">الرقم الوطني</th>
                                    <th className="p-3">الهاتف</th>
                                    <th className="p-3">الصفة</th>
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
                                        <td className="p-3 font-medium">
                                            {row.first_name ?? ""} {row.last_name ?? ""}
                                        </td>
                                        <td className="p-3 text-[#6F013F] font-semibold">
                                            #{row.family_id ?? "—"}
                                        </td>
                                        <td className="p-3">
                                            {relationshipLabel(row.relationship)}
                                        </td>
                                        <td className="p-3 text-center font-mono">
                                            {row.national_id ?? "—"}
                                        </td>
                                        <td className="p-3 text-gray-600">
                                            <span dir="ltr">{row.phone ?? "—"}</span>
                                        </td>
                                        <td className="p-3">
                                            {row.is_primary_contact ? (
                                                <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                                                    رئيسي
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                                                    ثانوي
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 rounded-l-xl text-center">
                                            <div className="flex items-center justify-center gap-4">
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
                                                <button onClick={() => onEdit?.(row)}>
                                                    <Image
                                                        src="/icons/Edit.png"
                                                        width={18}
                                                        height={18}
                                                        alt="edit"
                                                    />
                                                </button>
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
                                    <span className="text-gray-500">الاسم:</span>
                                    <span className="font-medium">
                                        {row.first_name ?? ""} {row.last_name ?? ""}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">العائلة:</span>
                                    <span className="font-medium text-[#6F013F]">
                                        #{row.family_id ?? "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">العلاقة:</span>
                                    <span>{relationshipLabel(row.relationship)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">الهاتف:</span>
                                    <span dir="ltr">{row.phone ?? "—"}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">الصفة:</span>
                                    {row.is_primary_contact ? (
                                        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                                            رئيسي
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                                            ثانوي
                                        </span>
                                    )}
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
                                    <button onClick={() => onEdit?.(row)}>
                                        <Image
                                            src="/icons/Edit.png"
                                            width={20}
                                            height={20}
                                            alt="edit"
                                        />
                                    </button>
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
