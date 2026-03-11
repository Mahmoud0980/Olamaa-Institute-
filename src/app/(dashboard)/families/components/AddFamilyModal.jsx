"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
    useAddFamilyMutation,
    useUpdateFamilyMutation,
} from "@/store/services/familiesApi";

export default function AddFamilyModal({ isOpen, onClose, family }) {
    const [addFamily] = useAddFamilyMutation();
    const [updateFamily] = useUpdateFamilyMutation();
    const [loading, setLoading] = useState(false);

    const step = 1;
    const total = 1;

    const [form, setForm] = useState({ user_id: "" });

    useEffect(() => {
        if (!isOpen) return;
        if (family) {
            setForm({ user_id: family?.user_id ?? "" });
        } else {
            setForm({ user_id: "" });
        }
    }, [isOpen, family]);

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const payload = {
                user_id: form.user_id ? Number(form.user_id) : null,
            };

            if (family) {
                await updateFamily({ id: family.id, ...payload }).unwrap();
                toast.success("تم تعديل العائلة بنجاح");
            } else {
                await addFamily(payload).unwrap();
                toast.success("تم إنشاء العائلة بنجاح");
            }

            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "فشل في حفظ البيانات");
        }

        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md flex">
            <div className="w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#6F013F] font-semibold">
                        {family ? "تعديل عائلة" : "إنشاء عائلة جديدة"}
                    </h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                    </button>
                </div>

                <Stepper current={step} total={total} />

                <div className="mt-6 space-y-5">
                    {/* INFO */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-sm text-blue-700 leading-relaxed">
                            العائلة هي كيان يجمع الطلاب وأولياء الأمور معاً. عند إنشاء عائلة
                            جديدة، يمكنك لاحقاً ربطها بطلاب وأولياء أمور وتفعيل حساب لها.
                        </p>
                    </div>

                    {/* USER ID (optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            معرف المستخدم (اختياري)
                        </label>
                        <input
                            type="number"
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm
                         focus:border-[#AD164C] focus:ring-1 focus:ring-[#AD164C] outline-none"
                            placeholder="اتركه فارغاً لإنشاء عائلة بدون حساب"
                            value={form.user_id}
                            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            يمكنك تفعيل حساب العائلة لاحقاً من زر &quot;تفعيل الحساب&quot;
                        </p>
                    </div>

                    <StepButtonsSmart
                        step={step}
                        total={total}
                        isEdit={!!family}
                        loading={loading}
                        onNext={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
