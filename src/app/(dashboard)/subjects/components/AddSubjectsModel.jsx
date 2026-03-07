"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

import {
  useAddSubjectMutation,
  useUpdateSubjectMutation,
} from "@/store/services/subjectsApi";

import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";

export default function AddSubjectModal({
  isOpen,
  onClose,
  subject,
  subjects = [],
}) {
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
          academic_branch_id: String(
            subject.academic_branch_id || subject.academic_branch?.id || "",
          ),
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
  // SUBJECT NAMES CHECK
  // ===========================
  const subjectNames = useMemo(() => {
    return subjects
      .filter((s) => !subject || s.id !== subject.id)
      .map((s) => s.name?.toLowerCase().trim());
  }, [subjects, subject]);

  // ===========================
  // OPTIONS
  // ===========================
  const branchOptions = useMemo(() => {
    return academicBranches.map((b, idx) => ({
      key: b.id ?? `branch-${idx}`,
      value: String(b.id),
      label: b.name,
    }));
  }, [academicBranches]);

  // ===========================
  // SUBMIT
  // ===========================
  const handleSubmit = async () => {
    const trimmedName = form.name.trim();

    if (!trimmedName) return notify.error("اسم المادة مطلوب");
    if (trimmedName.length > 100) return notify.error("اسم المادة طويل جدًا");

    const normalized = trimmedName.toLowerCase();
    if (subjectNames.includes(normalized)) return notify.error("المادة موجودة");

    if (!form.academic_branch_id) return notify.error("الفرع الأكاديمي مطلوب");

    try {
      setLoading(true);

      const payload = {
        name: trimmedName,
        description: form.description?.trim() || "",
        academic_branch_id: Number(form.academic_branch_id),
      };

      if (subject) {
        await updateSubject({ id: subject.id, ...payload }).unwrap();
        notify.success("تم تعديل المادة بنجاح");
      } else {
        await addSubject(payload).unwrap();
        notify.success("تمت إضافة المادة بنجاح");
      }

      onClose();
    } catch (err) {
      console.log(err);
      notify.error(err?.data?.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

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

          <button type="button" onClick={onClose}>
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
            error={!form.name.trim() ? "اسم المادة مطلوب" : ""}
          />

          <FormInput
            label="الوصف"
            placeholder="وصف اختياري"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <SearchableSelect
            label="الفرع الأكاديمي"
            required
            placeholder="اختر الفرع"
            value={form.academic_branch_id}
            options={branchOptions}
            onChange={(value) =>
              setForm({ ...form, academic_branch_id: value })
            }
          />

          {!form.academic_branch_id && (
            <p className="text-sm text-red-500 -mt-3">الفرع الأكاديمي مطلوب</p>
          )}

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
