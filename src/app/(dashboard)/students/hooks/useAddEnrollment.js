"use client";

import { useAddEnrollmentMutation } from "@/store/services/enrollmentsApi";

/* =====================================================
   Helper: append any field safely to FormData
===================================================== */
function appendField(fd, key, value) {
  if (value === undefined || value === null) return;

  if (value instanceof FileList) {
    if (value.length > 0) fd.append(key, value[0]);
    return;
  }

  if (Array.isArray(value) && value[0] instanceof File) {
    fd.append(key, value[0]);
    return;
  }

  if (value instanceof File) {
    fd.append(key, value);
    return;
  }

  if (value !== "") fd.append(key, value);
}

/* =====================================================
   Hook
===================================================== */
export default function useAddEnrollment() {
  const [addEnrollment, { isLoading }] = useAddEnrollmentMutation();

  const handleAddEnrollment = async (formData) => {
    try {
      const fd = new FormData();

      Object.entries(formData.student || {}).forEach(([k, v]) =>
        appendField(fd, `student[${k}]`, v)
      );

      Object.entries(formData.father || {}).forEach(([k, v]) =>
        appendField(fd, `father[${k}]`, v)
      );

      Object.entries(formData.mother || {}).forEach(([k, v]) =>
        appendField(fd, `mother[${k}]`, v)
      );

      // is_existing_family_confirmed
      // is_existing_family_confirmed
      if ("is_existing_family_confirmed" in formData) {
        if (formData.is_existing_family_confirmed === null) {
          // 👈 مثل Swagger: الحقل موجود بدون قيمة
          fd.append("is_existing_family_confirmed", "");
        } else {
          // 👈 قرار المستخدم
          fd.append(
            "is_existing_family_confirmed",
            formData.is_existing_family_confirmed ? "true" : "false"
          );
        }
      }

      for (const [k, v] of fd.entries()) {
        console.log("FD =>", k, v);
      }

      const res = await addEnrollment(fd).unwrap();

      console.log("📦 Enrollment API raw response:", res);

      return res;
    } catch (err) {
      console.error("❌ Enrollment error:", err);
      throw err;
    }
  };

  return { handleAddEnrollment, isLoading };
}
