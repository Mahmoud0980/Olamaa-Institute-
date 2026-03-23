"use client";

import Image from "next/image";
import { useMemo } from "react";
import DataTable from "@/components/common/DataTable";

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
    const columns = useMemo(() => [
        { 
            header: "اسم ولي الأمر", 
            key: "id", 
            render: (_, row) => `${row.first_name ?? ""} ${row.last_name ?? ""}` 
        },
        { 
            header: "رقم العائلة", 
            key: "family_id", 
            render: (val) => <span className="text-[#6F013F] font-semibold">#{val ?? "—"}</span> 
        },
        { 
            header: "العلاقة", 
            key: "relationship", 
            render: (val) => relationshipLabel(val) 
        },
        { 
            header: "الرقم الوطني", 
            key: "national_id", 
            render: (val) => <span className="font-mono">{val ?? "—"}</span> 
        },
        { 
            header: "الهاتف", 
            key: "phone", 
            render: (val) => <span dir="ltr">{val ?? "—"}</span> 
        },
        { 
            header: "الصفة", 
            key: "is_primary_contact", 
            render: (val) => val ? (
                <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                    رئيسي
                </span>
            ) : (
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-500">
                    ثانوي
                </span>
            )
        },
    ], []);

    const renderActions = (row) => (
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
    );

    return (
        <DataTable
            data={guardians}
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
