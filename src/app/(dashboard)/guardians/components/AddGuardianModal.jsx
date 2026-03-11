"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import {
    useAddGuardianMutation,
    useUpdateGuardianMutation,
} from "@/store/services/guardiansApi";
import { useGetFamiliesQuery } from "@/store/services/familiesApi";

const relationshipOptions = [
    { value: "father", label: "أب" },
    { value: "mother", label: "أم" },
    { value: "legal_guardian", label: "ولي أمر قانوني" },
    { value: "other", label: "أخرى" },
];

export default function AddGuardianModal({ isOpen, onClose, guardian }) {
    const [addGuardian] = useAddGuardianMutation();
    const [updateGuardian] = useUpdateGuardianMutation();

    const { data: familiesRes, isLoading: familiesLoading } = useGetFamiliesQuery();
    const families = familiesRes?.data || [];

    const familyOptions = useMemo(() => {
        return families.map((f) => ({
            value: String(f.id),
            label: `عائلة #${f.id} ${f.user?.name ? `(${f.user.name})` : ""}`,
        }));
    }, [families]);

    const [loading, setLoading] = useState(false);

    const step = 1;
    const total = 1;

    const [form, setForm] = useState({
        family_id: "",
        first_name: "",
        last_name: "",
        national_id: "",
        phone: "",
        is_primary_contact: false,
        occupation: "",
        address: "",
        relationship: "",
    });

    useEffect(() => {
        if (!isOpen) return;

        if (guardian) {
            setForm({
                family_id: guardian.family_id ? String(guardian.family_id) : "",
                first_name: guardian.first_name ?? "",
                last_name: guardian.last_name ?? "",
                national_id: guardian.national_id ?? "",
                phone: guardian.phone ?? "",
                is_primary_contact: !!guardian.is_primary_contact,
                occupation: guardian.occupation ?? "",
                address: guardian.address ?? "",
                relationship: guardian.relationship ?? "",
            });
        } else {
            setForm({
                family_id: "",
                first_name: "",
                last_name: "",
                national_id: "",
                phone: "",
                is_primary_contact: false,
                occupation: "",
                address: "",
                relationship: "",
            });
        }
    }, [isOpen, guardian]);

    const handleSubmit = async () => {
        if (!form.first_name.trim()) return toast.error("الاسم الأول مطلوب");
        if (!form.last_name.trim()) return toast.error("الشهره مطلوبة");

        try {
            setLoading(true);

            const payload = {
                family_id: form.family_id ? Number(form.family_id) : null,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                national_id: form.national_id?.trim() || null,
                phone: form.phone?.trim() || null,
                is_primary_contact: form.is_primary_contact,
                occupation: form.occupation?.trim() || null,
                address: form.address?.trim() || null,
                relationship: form.relationship || null,
            };

            if (guardian) {
                await updateGuardian({ id: guardian.id, ...payload }).unwrap();
                toast.success("تم تعديل ولي الأمر");
            } else {
                await addGuardian(payload).unwrap();
                toast.success("تم إضافة ولي الأمر بنجاح");
            }

            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "فشل حفظ البيانات");
            console.error(err);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 justify-start z-[60] backdrop-blur-md flex">
            <div className="w-[500px] bg-white h-full shadow-xl overflow-y-auto">
                {/* HEADER */}
                <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-[#6F013F] font-semibold">
                        {guardian ? "تعديل بيانات ولي الأمر" : "إضافة ولي أمر"}
                    </h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                <div className="p-6">
                    <Stepper current={step} total={total} />

                    <div className="mt-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="الاسم الأول"
                                required
                                placeholder="مثال: أحمد"
                                value={form.first_name}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                            />
                            <FormInput
                                label="الكنية"
                                required
                                placeholder="مثال: السيد"
                                value={form.last_name}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                            />
                        </div>

                        <SearchableSelect
                            label="العائلة التابع لها"
                            value={form.family_id}
                            onChange={(v) => setForm({ ...form, family_id: v })}
                            options={familyOptions}
                            placeholder={familiesLoading ? "جاري التحميل..." : "ابحث عن عائلة..."}
                            disabled={familiesLoading}
                            allowClear
                        />

                        <SearchableSelect
                            label="صلة القرابة"
                            value={form.relationship}
                            onChange={(v) => setForm({ ...form, relationship: v })}
                            options={relationshipOptions}
                            placeholder="اختر صلة القرابة..."
                            allowClear
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="الرقم الوطني"
                                placeholder="أدخل الرقم الوطني..."
                                value={form.national_id}
                                onChange={(e) => setForm({ ...form, national_id: e.target.value })}
                            />
                            <FormInput
                                label="رقم الهاتف"
                                placeholder="مثال: +963912345678"
                                dir="ltr"
                                className="text-left"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <FormInput
                            label="المهنة"
                            placeholder="مثال: مهندس"
                            value={form.occupation}
                            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                العنوان
                            </label>
                            <textarea
                                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                           focus:border-[#AD164C] focus:ring-1 focus:ring-[#AD164C] outline-none"
                                rows="3"
                                placeholder="تفاصيل العنوان..."
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                            <span className="text-sm text-gray-700">تواصل رئيسي</span>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-[#6F013F]"
                                    checked={form.is_primary_contact}
                                    onChange={(e) =>
                                        setForm({ ...form, is_primary_contact: e.target.checked })
                                    }
                                />
                                <span className="text-sm text-gray-600">
                                    {form.is_primary_contact ? "نعم" : "لا"}
                                </span>
                            </label>
                        </div>

                        <StepButtonsSmart
                            step={step}
                            total={total}
                            isEdit={!!guardian}
                            loading={loading}
                            onNext={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
