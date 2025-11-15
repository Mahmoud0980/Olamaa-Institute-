"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SelectInput from "@/components/common/SelectInput";

// APIs
import {
  useAddBatchMutation,
  useUpdateBatchMutation,
} from "@/store/services/batchesApi";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";

export default function AddBatchModal({ isOpen, onClose, batch }) {
  const [addBatch] = useAddBatchMutation();
  const [updateBatch] = useUpdateBatchMutation();

  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const { data: academicData } = useGetAcademicBranchesQuery();
  const academicBranches = academicData?.data || [];

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  const [form, setForm] = useState({
    name: "",
    institute_branch_id: "",
    academic_branch_id: "",
    start_date: "",
    end_date: "",
    is_archived: false,
    is_hidden: false,
    is_completed: false,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (batch) {
      setForm({
        name: batch.name,
        institute_branch_id: batch.institute_branch_id,
        academic_branch_id: batch.academic_branch_id,
        start_date: batch.start_date,
        end_date: batch.end_date,
        is_archived: batch.is_archived,
        is_hidden: batch.is_hidden,
        is_completed: batch.is_completed,
      });
    } else {
      setForm({
        name: "",
        institute_branch_id: "",
        academic_branch_id: "",
        start_date: "",
        end_date: "",
        is_archived: false,
        is_hidden: false,
        is_completed: false,
      });
    }
  }, [isOpen, batch]);

  const handleSubmit = async () => {
    // 🔴 التحقق من الحقول المطلوبة
    if (!form.name.trim()) return toast.error("اسم الشعبة مطلوب");
    if (!form.institute_branch_id) return toast.error("الفرع مطلوب");
    if (!form.academic_branch_id) return toast.error("الفرع الأكاديمي مطلوب");
    if (!form.start_date) return toast.error("تاريخ البداية مطلوب");
    if (!form.end_date) return toast.error("تاريخ النهاية مطلوب");

    // 🔴 التحقق من أن تاريخ النهاية أكبر من تاريخ البداية
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);

    if (end <= start) {
      return toast.error("تاريخ النهاية يجب أن يكون أكبر من تاريخ البداية");
    }

    try {
      setLoading(true);

      if (batch) {
        await updateBatch({ id: batch.id, ...form }).unwrap();
        toast.success("تم تعديل الشعبة");
      } else {
        await addBatch(form).unwrap();
        toast.success("تم إضافة الشعبة بنجاح");
      }

      onClose();
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ");
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {batch ? "تعديل شعبة" : "إضافة شعبة جديدة"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم الشعبة"
            required
            placeholder="مثال: شعبة صيف 2025"
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
          />

          <SelectInput
            label="الفرع"
            required
            value={form.institute_branch_id}
            onChange={(e) =>
              setForm({ ...form, institute_branch_id: e.target.value })
            }
            placeholder="اختر الفرع"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
          />

          <SelectInput
            label="الفرع الأكاديمي"
            required
            value={form.academic_branch_id}
            onChange={(e) =>
              setForm({ ...form, academic_branch_id: e.target.value })
            }
            placeholder="اختر الفرع الأكاديمي"
            options={academicBranches.map((a) => ({
              value: a.id,
              label: a.name,
            }))}
          />

          <FormInput
            label="تاريخ البداية"
            required
            type="date"
            value={form.start_date}
            register={{
              onChange: (e) => setForm({ ...form, start_date: e.target.value }),
            }}
          />

          <FormInput
            label="تاريخ النهاية"
            required
            type="date"
            value={form.end_date}
            register={{
              onChange: (e) => setForm({ ...form, end_date: e.target.value }),
            }}
          />

          <SelectInput
            label="مؤرشفة؟"
            value={form.is_archived}
            onChange={(e) =>
              setForm({ ...form, is_archived: e.target.value === "true" })
            }
            options={[
              { value: "false", label: "لا" },
              { value: "true", label: "نعم" },
            ]}
          />

          <SelectInput
            label="مخفية؟"
            value={form.is_hidden}
            onChange={(e) =>
              setForm({ ...form, is_hidden: e.target.value === "true" })
            }
            options={[
              { value: "false", label: "لا" },
              { value: "true", label: "نعم" },
            ]}
          />

          <SelectInput
            label="مكتملة؟"
            value={form.is_completed}
            onChange={(e) =>
              setForm({ ...form, is_completed: e.target.value === "true" })
            }
            options={[
              { value: "false", label: "لا" },
              { value: "true", label: "نعم" },
            ]}
          />

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!batch}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
