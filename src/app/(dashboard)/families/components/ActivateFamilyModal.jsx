"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { useActivateFamilyUserMutation } from "@/store/services/familiesApi";

export default function ActivateFamilyModal({ isOpen, onClose, family }) {
    const [activateUser] = useActivateFamilyUserMutation();
    const [loading, setLoading] = useState(false);

    const handleActivate = async () => {
        if (!family?.id) return;

        try {
            setLoading(true);
            await activateUser(family.id).unwrap();
            toast.success("تم تفعيل حساب العائلة بنجاح");
            onClose();
        } catch (err) {
            toast.error(err?.data?.message || "فشل تفعيل الحساب (قد يكون الرابط موجود مسبقاً أو لا يوجد طلاب)");
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-lg text-gray-800">تفعيل حساب العائلة</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        سيتم إنشاء حساب مستخدم جديد لهذه العائلة. كلمة المرور الافتراضية ستكون{" "}
                        <span className="font-semibold bg-gray-100 px-1 rounded text-gray-800">
                            Pass1234
                        </span>
                        ، وسيُطلب من المستخدم تغييرها عند أول تسجيل دخول.
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleActivate}
                            disabled={loading}
                            className="px-4 py-2 text-sm text-white font-medium bg-[#6F013F] hover:bg-[#AD164C] rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? "جاري التفعيل..." : "تأكيد التفعيل"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
