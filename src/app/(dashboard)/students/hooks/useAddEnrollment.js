"use client";
import { useAddEnrollmentMutation } from "@/store/services/enrollmentsApi";
import { toast } from "react-hot-toast";

export default function useAddEnrollment() {
  const [addEnrollment, { isLoading }] = useAddEnrollmentMutation();

  const handleAddEnrollment = async (formData, onFamilyConfirm) => {
    try {
      const fd = new FormData();

      // 🧱 تعبئة حقول الطالب
      Object.entries(formData.student).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(`student[${key}]`, value);
        }
      });

      // 👨‍👩‍👧 تعبئة بيانات الأب والأم
      Object.entries(formData.father || {}).forEach(([key, value]) => {
        if (value) fd.append(`father[${key}]`, value);
      });
      Object.entries(formData.mother || {}).forEach(([key, value]) => {
        if (value) fd.append(`mother[${key}]`, value);
      });

      // ✅ إذا المستخدم اختار التصرف مع العائلة
      if (formData.is_existing_family_confirmed !== undefined) {
        fd.append(
          "is_existing_family_confirmed",
          formData.is_existing_family_confirmed
        );
      }

      const res = await addEnrollment(fd).unwrap();

      // 🔎 حالة العائلة موجودة مسبقًا
      if (res?.status && res?.message?.includes("عائلة موجودة")) {
        if (onFamilyConfirm) onFamilyConfirm(res.data.family);
        return;
      }

      toast.success("تم إضافة الطالب بنجاح ✅");
      return res;
    } catch (err) {
      toast.error("حدث خطأ أثناء إضافة الطالب");
      console.error("❌ addEnrollment error:", err);
      throw err;
    }
  };

  return { handleAddEnrollment, isLoading };
}
