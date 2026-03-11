"use client";

import { X, User, Phone, MapPin, Briefcase, Hash } from "lucide-react";
import { useGetGuardianQuery } from "@/store/services/guardiansApi";
import { useGetFamilyQuery } from "@/store/services/familiesApi";

const relationshipLabel = (r) => {
    const map = {
        father: "أب",
        mother: "أم",
        legal_guardian: "ولي أمر قانوني",
        other: "أخرى",
    };
    return map[r] || r || "—";
};

export default function GuardianDetailsModal({ open, onClose, guardianId }) {
    const { data: guardianRes, isLoading: isLoadingGuardian } = useGetGuardianQuery(
        guardianId,
        { skip: !guardianId }
    );

    const guardian = guardianRes?.data;

    const { data: familyRes, isLoading: isLoadingFamily } = useGetFamilyQuery(
        guardian?.family_id,
        { skip: !guardian?.family_id }
    );

    const family = familyRes?.data;
    const isLoading = isLoadingGuardian || (guardian?.family_id && isLoadingFamily);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-md flex justify-start">
            <div className="w-[500px] bg-white h-full shadow-xl overflow-y-auto">
                {/* HEADER */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[#6F013F] font-semibold text-lg">
                        تفاصيل ولي الأمر
                    </h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col gap-4 animate-pulse">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                            ))}
                        </div>
                    ) : !guardian ? (
                        <div className="text-center text-gray-400 py-10">
                            لم يتم العثور على بيانات
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Guardian Info Card */}
                            <div className="bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6F013F] border-2 border-pink-100 shadow-sm">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {guardian.first_name} {guardian.last_name}
                                        </h3>
                                        <div className="flex gap-2 mt-1">
                                            {guardian.is_primary_contact ? (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium border border-emerald-200">
                                                    جهة تواصل رئيسية
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">
                                                    جهة تواصل ثانوية
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                                {relationshipLabel(guardian.relationship)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Hash className="w-4 h-4" />
                                            <span className="text-xs">الرقم الوطني</span>
                                        </div>
                                        <span className="font-mono text-sm font-medium">
                                            {guardian.national_id || "—"}
                                        </span>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-xs">رقم الهاتف</span>
                                        </div>
                                        <span className="text-sm font-medium" dir="ltr">
                                            {guardian.phone || "—"}
                                        </span>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="text-xs">المهنة</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {guardian.occupation || "—"}
                                        </span>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs">العنوان</span>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {guardian.address || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Linked Family Info */}
                            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white">
                                <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <UsersIcon className="w-5 h-5 text-gray-500" />
                                        العائلة المرتبطة
                                    </h4>
                                    {guardian.family_id && (
                                        <span className="px-2 py-1 text-xs rounded-full bg-[#6F013F]/10 text-[#6F013F] font-bold">
                                            عائلة #{guardian.family_id}
                                        </span>
                                    )}
                                </div>

                                <div className="p-4">
                                    {!guardian.family_id ? (
                                        <div className="text-center text-sm text-gray-500 py-3">
                                            غير مرتبط بأي عائلة
                                        </div>
                                    ) : !family ? (
                                        <div className="text-center text-sm text-gray-500 py-3 animate-pulse">
                                            جاري تحميل بيانات العائلة...
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {family.user && (
                                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                        {family.user.name.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">حساب المستخـدم</p>
                                                        <p className="text-xs text-gray-500">{family.user.name}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {family.students && family.students.length > 0 ? (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 mb-2">أبناء العائلة المسجلين:</p>
                                                    <div className="space-y-2">
                                                        {family.students.map(student => (
                                                            <div key={student.id} className="flex items-center gap-2 border border-gray-100 p-2 rounded-lg bg-gray-50/50">
                                                                <div className="w-2 rounded-full h-2 bg-blue-400"></div>
                                                                <span className="text-sm font-medium text-gray-700">{student.full_name}</span>
                                                                <span className="text-xs text-gray-400 mr-auto">طالب #{student.id}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">لا يوجد طلاب مسجلين لهذه العائلة حالياً.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function UsersIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
