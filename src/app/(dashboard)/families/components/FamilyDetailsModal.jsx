"use client";

import { X } from "lucide-react";
import { useLazyGetFamilyQuery } from "@/store/services/familiesApi";
import { useEffect, useState } from "react";

const relationshipLabel = (r) => {
    const map = {
        father: "أب",
        mother: "أم",
        legal_guardian: "ولي أمر قانوني",
        other: "أخرى",
    };
    return map[r] || r || "—";
};

export default function FamilyDetailsModal({ open, onClose, familyId }) {
    const [fetchFamily, { data: familyRes, isFetching }] =
        useLazyGetFamilyQuery();
    const [family, setFamily] = useState(null);

    useEffect(() => {
        if (open && familyId) {
            fetchFamily(familyId)
                .unwrap()
                .then((res) => {
                    setFamily(res?.data ?? res);
                })
                .catch(() => { });
        }
    }, [open, familyId, fetchFamily]);

    useEffect(() => {
        if (!open) setFamily(null);
    }, [open]);

    if (!open) return null;

    const students = family?.students ?? [];
    const guardians = family?.guardians ?? [];

    return (
        <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-md flex justify-start">
            <div className="w-[500px] bg-white h-full shadow-xl overflow-y-auto">
                {/* HEADER */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[#6F013F] font-semibold text-lg">
                        تفاصيل العائلة #{familyId}
                    </h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {isFetching ? (
                        <div className="animate-pulse space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-8 bg-gray-100 rounded-lg" />
                            ))}
                        </div>
                    ) : !family ? (
                        <div className="py-10 text-center text-gray-400">
                            لم يتم العثور على بيانات
                        </div>
                    ) : (
                        <>
                            {/* FAMILY INFO */}
                            <div className="bg-gradient-to-l from-[#fbeaf3] to-white rounded-xl p-5 border border-pink-100">
                                <h3 className="text-sm font-semibold text-[#6F013F] mb-3">
                                    معلومات العائلة
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                        <span className="text-gray-500 whitespace-nowrap">رقم العائلة:</span>
                                        <span className="font-medium">#{family.id}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                        <span className="text-gray-500 whitespace-nowrap">حالة الحساب:</span>
                                        <span className="mr-2">
                                            {family.user_id ? (
                                                <span className="text-green-600 font-medium whitespace-nowrap">
                                                    مفعّل
                                                </span>
                                            ) : (
                                                <span className="text-amber-600 font-medium whitespace-nowrap">
                                                    غير مفعّل
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    {family.user && (
                                        <>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                <span className="text-gray-500 whitespace-nowrap">اسم المستخدم:</span>
                                                <span className="font-medium whitespace-nowrap break-words">
                                                    {family.user.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                                <span className="text-gray-500 whitespace-nowrap">الدور:</span>
                                                <span className="whitespace-nowrap">{family.user.role}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex flex-col lg:flex-row lg:items-center md:col-span-2 gap-1">
                                        <span className="text-gray-500 whitespace-nowrap">تاريخ الإنشاء:</span>
                                        <span className="font-medium text-gray-800" dir="ltr">
                                            {family.created_at?.split(" ")[0] ?? "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* STUDENTS */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        الطلاب التابعون ({students.length})
                                    </h3>
                                </div>

                                {students.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">
                                        لا يوجد طلاب مرتبطون بهذه العائلة
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {students.map((s) => (
                                            <div
                                                key={s.id}
                                                className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 border border-blue-100"
                                            >
                                                <div>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {s.full_name ??
                                                            `${s.first_name ?? ""} ${s.last_name ?? ""}`}
                                                    </span>
                                                    <span className="text-xs text-gray-400 mr-2">
                                                        #{s.id}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    طالب
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* GUARDIANS */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-5 bg-purple-500 rounded-full" />
                                    <h3 className="text-sm font-semibold text-gray-700">
                                        أولياء الأمور ({guardians.length})
                                    </h3>
                                </div>

                                {guardians.length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-400">
                                        لا يوجد أولياء أمور مرتبطون بهذه العائلة
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {guardians.map((g) => (
                                            <div
                                                key={g.id}
                                                className="bg-purple-50 rounded-xl px-4 py-3 border border-purple-100"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {g.first_name ?? ""} {g.last_name ?? ""}
                                                        </span>
                                                        <span className="text-xs text-gray-400 mr-2">
                                                            #{g.id}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {g.is_primary_contact && (
                                                            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                                جهة اتصال رئيسية
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                                            {relationshipLabel(g.relationship)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                                                    {g.phone && (
                                                        <div>
                                                            الهاتف:{" "}
                                                            <span className="text-gray-700">{g.phone}</span>
                                                        </div>
                                                    )}
                                                    {g.occupation && (
                                                        <div>
                                                            المهنة:{" "}
                                                            <span className="text-gray-700">
                                                                {g.occupation}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {g.address && (
                                                        <div className="col-span-2">
                                                            العنوان:{" "}
                                                            <span className="text-gray-700">
                                                                {g.address}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
