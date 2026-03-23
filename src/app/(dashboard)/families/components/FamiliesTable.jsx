"use client";

import { useMemo } from "react";
import Image from "next/image";
import DataTable from "@/components/common/DataTable";

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
    const columns = useMemo(() => [
        { 
            header: "رقم العائلة", 
            key: "id", 
            render: (val) => <span className="font-medium text-[#6F013F]">#{val}</span> 
        },
        { 
            header: "حساب المستخدم", 
            key: "user", 
            render: (val) => val?.name || <span className="text-gray-400">—</span> 
        },
        { 
            header: "عدد الطلاب", 
            key: "students_count", 
            className: "text-center",
            render: (val) => (
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    {val ?? 0}
                </span>
            )
        },
        { 
            header: "عدد أولياء الأمور", 
            key: "guardians_count", 
            className: "text-center",
            render: (val) => (
                <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold">
                    {val ?? 0}
                </span>
            )
        },
        { 
            header: "حالة الحساب", 
            key: "user_id", 
            render: (val) => statusBadge(!!val) 
        },
        { 
            header: "تاريخ الإنشاء", 
            key: "created_at", 
            render: (val) => <span className="text-gray-500 text-xs">{val?.split(" ")[0] ?? "—"}</span> 
        },
    ], []);

    const renderActions = (row) => (
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
    );

    return (
        <DataTable
            data={families}
            columns={columns}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectChange={onSelectChange}
            renderActions={renderActions}
            pageSize={8}
            emptyMessage="لا توجد بيانات."
        />
    );
}
