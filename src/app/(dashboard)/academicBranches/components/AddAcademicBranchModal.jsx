"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  useAddAcademicBranchMutation,
  useUpdateAcademicBranchMutation,
} from "@/store/services/academicBranchesApi";

export default function AddAcademicBranchModal({ isOpen, onClose, branch, branches = [] }) {
  const [addBranch] = useAddAcademicBranchMutation();
  const [updateBranch] = useUpdateAcademicBranchMutation();

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (branch) {
      setForm({
        name: branch.name,
        description: branch.description,
      });
    } else {
      setForm({
        name: "",
        description: "",
      });
    }
  }, [isOpen, branch]);

  // ===== أسماء الفروع الأكاديمية (للتحقق عند الحفظ فقط)
  const branchNames = branches
    .filter((b) => !branch || b.id !== branch.id)
    .map((b) => b.name?.toLowerCase().trim());

  const handleSubmit = async () => {
    if (!form.name.trim()) return notify.error("اسم الفرع الأكاديمي مطلوب");
    if (form.name.length > 100)
      return notify.error("اسم الفرع الأكاديمي طويل جدًا");

    const normalized = form.name.trim().toLowerCase();
    if (branchNames.includes(normalized))
      return notify.error("الفرع الأكاديمي موجود");

    if (!form.description.trim())
      return notify.error("وصف الفرع الأكاديمي مطلوب");

    try {
      setLoading(true);

      if (branch) {
        await updateBranch({ id: branch.id, ...form }).unwrap();
        notify.success("تم تعديل الفرع الأكاديمي");
      } else {
        await addBranch(form).unwrap();
        notify.success("تم إضافة الفرع الأكاديمي بنجاح");
      }

      onClose();
    } catch {
      notify.error("حدث خطأ أثناء الحفظ");
    }

    setLoading(false);
  };

  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md`}
    >
      <div className="w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {branch ? "تعديل فرع أكاديمي" : "إضافة فرع أكاديمي"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم الفرع"
            required
            placeholder="مثال: علوم الحاسوب"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <FormInput
            label="الوصف"
            required
            placeholder="أدخل وصف الفرع"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!branch}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
