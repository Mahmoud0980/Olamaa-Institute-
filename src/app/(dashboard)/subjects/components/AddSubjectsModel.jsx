"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SelectInput from "@/components/common/SelectInput";

import {
  useAddSubjectMutation,
  useUpdateSubjectMutation,
} from "@/store/services/subjectsApi";

import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";

export default function AddSubjectModal({ isOpen, onClose, subject }) {
  const [addSubject] = useAddSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();

  const { data: branchesData } = useGetAcademicBranchesQuery();
  const academicBranches = branchesData?.data || [];

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  // ===========================
  // FORM STATE
  // ===========================
  const [form, setForm] = useState({
    name: "",
    description: "",
    academic_branch_id: "",
  });

  // ===========================
  // RESET / FILL WHEN OPEN MODAL
  // ===========================
  useEffect(() => {
    if (isOpen) {
      if (subject) {
        setForm({
          name: subject.name || "",
          description: subject.description || "",
          academic_branch_id: subject.academic_branch_id || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
          academic_branch_id: "",
        });
      }
    }
  }, [isOpen, subject]);

  // ===========================
  // SUBMIT
  // ===========================
  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("اسم المادة مطلوب");
    if (!form.academic_branch_id) return toast.error("الفرع الأكاديمي مطلوب");

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        description: form.description || "",
        academic_branch_id: Number(form.academic_branch_id),
      };

      if (subject) {
        await updateSubject({ id: subject.id, ...payload }).unwrap();
        toast.success("تم تعديل المادة بنجاح");
      } else {
        await addSubject(payload).unwrap();
        toast.success("تمت إضافة المادة بنجاح");
      }

      setLoading(false);
      onClose();
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  // ===========================
  // OPTIONS
  // ===========================
  const branchOptions = academicBranches.map((b) => ({
    value: b.id,
    label: b.name,
  }));

  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md`}
    >
      <div className="w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {subject ? "تعديل مادة" : "إضافة مادة جديدة"}
          </h2>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        {/* FORM */}
        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم المادة"
            required
            placeholder="مثال: فيزياء"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!form.name ? "اسم المادة مطلوب" : ""}
          />

          <FormInput
            label="الوصف"
            placeholder="وصف اختياري"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <SelectInput
            label="الفرع الأكاديمي"
            required
            placeholder="اختر الفرع"
            value={form.academic_branch_id}
            options={branchOptions}
            onChange={(e) =>
              setForm({ ...form, academic_branch_id: e.target.value })
            }
            error={!form.academic_branch_id ? "الفرع الأكاديمي مطلوب" : ""}
          />

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!subject}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
