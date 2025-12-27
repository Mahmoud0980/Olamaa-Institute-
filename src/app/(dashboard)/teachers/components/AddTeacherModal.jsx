"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SelectInput from "@/components/common/SelectInput";
import PhoneInput from "@/components/common/PhoneInput";

import { useAddTeacherMutation } from "@/store/services/teachersApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function AddTeacherModal({ isOpen, onClose }) {
  const [addTeacher] = useAddTeacherMutation();
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    hire_date: "",
    institute_branch_id: "",
  });

  // ✅ validation
  const validate = () => {
    if (!form.name.trim()) return "اسم الأستاذ مطلوب";
    if (!form.phone) return "رقم الهاتف مطلوب";
    if (!form.specialization.trim()) return "الاختصاص مطلوب";
    if (!form.hire_date) return "تاريخ التعيين مطلوب";
    if (!form.institute_branch_id) return "الفرع مطلوب";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return toast.error(error);

    try {
      setLoading(true);

      const payload = {
        ...form,
        institute_branch_id: Number(form.institute_branch_id),
      };

      await addTeacher(payload).unwrap();
      toast.success("تم إضافة الأستاذ بنجاح");
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || "فشل الإضافة");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[460px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">إضافة أستاذ جديد</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          {/* الاسم */}
          <FormInput
            label="اسم الأستاذ"
            required
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
          />

          {/* رقم الهاتف */}
          <PhoneInput
            name="phone"
            value={form.phone}
            setValue={(name, value) => setForm({ ...form, phone: value })}
          />

          {/* الاختصاص */}
          <FormInput
            label="الاختصاص"
            required
            value={form.specialization}
            register={{
              onChange: (e) =>
                setForm({
                  ...form,
                  specialization: e.target.value,
                }),
            }}
          />

          {/* تاريخ التعيين */}
          <FormInput
            type="date"
            label="تاريخ التعيين"
            required
            value={form.hire_date}
            register={{
              onChange: (e) => setForm({ ...form, hire_date: e.target.value }),
            }}
          />

          {/* الفرع */}
          <SelectInput
            label="فرع المعهد"
            required
            value={form.institute_branch_id}
            options={branches.map((b) => ({
              value: b.id,
              label: b.name,
            }))}
            onChange={(e) =>
              setForm({
                ...form,
                institute_branch_id: e.target.value,
              })
            }
          />

          <StepButtonsSmart
            step={step}
            total={total}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
