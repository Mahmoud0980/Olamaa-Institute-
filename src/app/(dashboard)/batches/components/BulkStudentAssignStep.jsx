"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, Trash2, Info, CheckCircle, AlertCircle, HelpCircle, MapPin } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import {
    useGetUnassignedStudentsQuery,
    useBulkAssignStudentsMutation,
} from "@/store/services/batchStudentsApi";

export default function BulkStudentAssignStep({ batchId, batchName, onDone }) {
    // ===== API =====
    const {
        data: unassignedData,
        isLoading: loadingStudents,
        isFetching,
        isError,
        error,
    } = useGetUnassignedStudentsQuery(
        { batch_id: batchId, location_filter: "same_location" },
        { skip: !batchId }
    );

    const [bulkAssign, { isLoading: saving }] = useBulkAssignStudentsMutation();

    // ===== Debug Logging =====
    console.log("=== BulkStudentAssignStep DEBUG ===");
    console.log("batchId prop:", batchId, "type:", typeof batchId);
    console.log("batchName prop:", batchName);
    console.log("skip query:", !batchId);
    console.log("isLoading:", loadingStudents, "isFetching:", isFetching, "isError:", isError);
    console.log("unassignedData:", JSON.stringify(unassignedData, null, 2));
    if (isError) console.error("API Error:", JSON.stringify(error, null, 2));

    // ===== Local State =====
    const [selectedIds, setSelectedIds] = useState([]); // الطلاب المحددين بالـ checkboxes
    const [addedStudents, setAddedStudents] = useState([]); // الطلاب المُضافين بزر "إضافة +"

    // ===== Data =====
    const allStudents = unassignedData?.data || [];
    const meta = unassignedData?.meta || {};

    console.log("allStudents count:", allStudents.length);

    // الطلاب المتبقين (غير المُضافين بعد)
    const availableStudents = useMemo(() => {
        const addedIds = new Set(addedStudents.map((s) => s.id));
        return allStudents.filter((s) => !addedIds.has(s.id));
    }, [allStudents, addedStudents]);

    // ===== Select Handlers =====
    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === availableStudents.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(availableStudents.map((s) => s.id));
        }
    };

    const isAllSelected =
        availableStudents.length > 0 &&
        selectedIds.length === availableStudents.length;

    // ===== Add to local list =====
    const handleAdd = () => {
        if (selectedIds.length === 0) {
            notify.error("يرجى تحديد طالب واحد على الأقل");
            return;
        }

        const newStudents = availableStudents.filter((s) =>
            selectedIds.includes(s.id)
        );
        setAddedStudents((prev) => [...prev, ...newStudents]);
        setSelectedIds([]);
    };

    // ===== Remove from local list =====
    const handleRemoveAdded = (id) => {
        setAddedStudents((prev) => prev.filter((s) => s.id !== id));
    };

    // ===== Save to backend =====
    const handleSave = async () => {
        if (addedStudents.length === 0) {
            notify.error("لم يتم إضافة أي طالب بعد");
            return;
        }

        try {
            const result = await bulkAssign({
                batch_id: batchId,
                student_ids: addedStudents.map((s) => s.id),
            }).unwrap();

            notify.success(
                result?.message ||
                `تمت إضافة ${addedStudents.length} طلاب إلى الشعبة بنجاح`
            );
            onDone?.();
        } catch (err) {
            const msg =
                err?.data?.message || err?.data?.errors?.already_assigned_ids
                    ? "بعض الطلاب مرتبطون بشعبة بالفعل"
                    : "حدث خطأ أثناء الحفظ";
            notify.error(msg);
        }
    };

    // ===== Status Helpers =====
    const renderStatusBadge = (status) => {
        switch (status) {
            case "matching":
                return (
                    <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" /> مطابق
                    </span>
                );
            case "no_location":
                return (
                    <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <MapPin className="w-3 h-3" /> يحتاج موقع
                    </span>
                );
            case "no_branch":
                return (
                    <span className="flex items-center gap-1 text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <AlertCircle className="w-3 h-3" /> يحتاج فرع
                    </span>
                );
            case "no_branch_no_location":
                return (
                    <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <HelpCircle className="w-3 h-3" /> جديد
                    </span>
                );
            default:
                return null;
        }
    };

    // ===== Render =====
    return (
        <div className="space-y-4">
            {/* ===== معلومات الدورة ===== */}
            <div className="text-right text-sm text-gray-600 mb-2">
                <span className="font-medium text-gray-800">معلومات الدورة</span>
                <br />
                اسم الدورة :{" "}
                <span className="font-semibold text-[#6F013F]">
                    {batchName || meta.batch_name || "—"}
                </span>
            </div>

            {/* ===== عنوان الطلاب غير المنتسبين ===== */}
            <h3 className="text-right font-semibold text-sm text-gray-800">
                الطلاب الغير منتسبين لدورة
            </h3>

            {/* ===== إضافة + تحديد الكل ===== */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={selectedIds.length === 0}
                        className="flex items-center gap-1 text-sm text-[#6F013F] hover:text-[#a0205f] disabled:text-gray-400 disabled:cursor-not-allowed transition"
                    >
                        <Plus className="w-4 h-4" />
                        إضافة
                    </button>

                    {/* Legend (Tiny Legend) */}
                    <div className="hidden lg:flex items-center gap-2 border-r pr-4 border-gray-100">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-green-400" /> مطابق
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-blue-400" /> يحتاج موقع
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" /> يحتاج فرع
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-gray-400" /> جديد
                        </div>
                    </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    تحديد الكل
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-[#6F013F] cursor-pointer"
                    />
                </label>
            </div>

            {/* ===== جدول الطلاب المتاحين ===== */}
            {loadingStudents || isFetching ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin ml-2" />
                    جاري التحميل...
                </div>
            ) : availableStudents.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-400">
                    لا يوجد طلاب غير منتسبين
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[80px_1fr_1fr_100px] bg-pink-50 text-gray-700 text-xs font-semibold border-b">
                        <div className="py-2 text-center">#</div>
                        <div className="py-2 text-center text-pink-600">الاسم</div>
                        <div className="py-2 text-center text-pink-600">الكنية</div>
                        <div className="py-2 text-center text-pink-600">التوافق</div>
                    </div>

                    {/* Body */}
                    <div className="max-h-[240px] overflow-y-auto divide-y divide-gray-100">
                        {availableStudents.map((student, idx) => (
                            <div
                                key={student.id}
                                className={`grid grid-cols-[80px_1fr_1fr_100px] text-sm items-center ${selectedIds.includes(student.id)
                                    ? "bg-pink-50"
                                    : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="py-2 flex items-center justify-center gap-3">
                                    <span className="text-gray-400 text-xs w-4">
                                        {idx + 1}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(student.id)}
                                        onChange={() => toggleSelect(student.id)}
                                        className="w-4 h-4 accent-[#6F013F] cursor-pointer"
                                    />
                                </div>
                                <div className="py-2 text-center text-gray-700">
                                    {student.first_name}
                                </div>
                                <div className="py-2 text-center text-gray-700">
                                    {student.last_name}
                                </div>
                                <div className="py-2 flex justify-center px-1" title={student.assignment_status_description}>
                                    {renderStatusBadge(student.assignment_status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== الطلاب المُضافين (القائمة المحلية) ===== */}
            {addedStudents.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        الطلاب المُضافين ({addedStudents.length})
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[160px] overflow-y-auto divide-y divide-gray-100">
                            {addedStudents.map((student, idx) => (
                                <div
                                    key={student.id}
                                    className="grid grid-cols-[40px_1fr_1fr_40px] text-sm items-center bg-green-50"
                                >
                                    <div className="py-2 text-center text-gray-400 text-xs">
                                        {idx + 1}
                                    </div>
                                    <div className="py-2 text-center text-gray-700">
                                        {student.first_name}
                                    </div>
                                    <div className="py-2 text-center text-gray-700">
                                        {student.last_name}
                                    </div>
                                    <div className="py-2 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAdded(student.id)}
                                            className="text-red-400 hover:text-red-600 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== زر حفظ ===== */}
            <div className="pt-4 flex justify-end">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || addedStudents.length === 0}
                    className="px-10 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition
            bg-gradient-to-r from-[#6F013F] via-[#6F013F] to-[#8a1755] text-white hover:opacity-90
            disabled:bg-none disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm border border-gray-100"
                >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    حفظ
                </button>
            </div>
        </div>
    );
}
