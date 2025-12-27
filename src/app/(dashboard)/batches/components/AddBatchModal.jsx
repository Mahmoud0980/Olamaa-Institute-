"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SelectInput from "@/components/common/SelectInput";

// ===== APIs =====
import {
  useAddBatchMutation,
  useUpdateBatchMutation,
} from "@/store/services/batchesApi";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetClassRoomsQuery } from "@/store/services/classRoomsApi";

export default function AddBatchModal({ isOpen, onClose, batch }) {
  const [addBatch] = useAddBatchMutation();
  const [updateBatch] = useUpdateBatchMutation();

  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const { data: academicData } = useGetAcademicBranchesQuery();
  const academicBranches = academicData?.data || [];

  const { data: roomsData } = useGetClassRoomsQuery();
  const classRooms = roomsData?.data || [];

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  // ===== Form =====
  const initialForm = {
    name: "",
    institute_branch_id: "",
    academic_branch_id: "",
    class_room_id: "",
    gender_type: "",
    start_date: "",
    end_date: "",
    is_archived: "false",
    is_hidden: "false",
    is_completed: "false",
  };

  const [form, setForm] = useState(initialForm);

  // ===== Fill form on edit =====
  useEffect(() => {
    if (!isOpen) return;

    if (batch) {
      setForm({
        name: batch.name ?? "",
        institute_branch_id: batch.institute_branch?.id?.toString() ?? "",
        academic_branch_id: batch.academic_branch?.id?.toString() ?? "",
        class_room_id: batch.class_room?.id?.toString() ?? "",
        gender_type: batch.gender_type ?? "",
        start_date: batch.start_date ?? "",
        end_date: batch.end_date ?? "",
        is_archived: batch.is_archived ? "true" : "false",
        is_hidden: batch.is_hidden ? "true" : "false",
        is_completed: batch.is_completed ? "true" : "false",
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, batch]);

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("اسم الشعبة مطلوب");
    if (!form.institute_branch_id) return toast.error("يرجى اختيار الفرع");
    if (!form.academic_branch_id)
      return toast.error("يرجى اختيار الفرع الأكاديمي");
    if (!form.class_room_id) return toast.error("يرجى اختيار القاعة");
    if (!form.gender_type) return toast.error("يرجى تحديد الجنس");
    if (!form.start_date) return toast.error("تاريخ البداية مطلوب");
    if (!form.end_date) return toast.error("تاريخ النهاية مطلوب");

    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    if (end <= start)
      return toast.error("تاريخ النهاية يجب أن يكون بعد تاريخ البداية");

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        institute_branch_id: Number(form.institute_branch_id),
        academic_branch_id: Number(form.academic_branch_id),
        class_room_id: Number(form.class_room_id),
        gender_type: form.gender_type,
        start_date: form.start_date,
        end_date: form.end_date,
        is_archived: form.is_archived === "true",
        is_hidden: form.is_hidden === "true",
        is_completed: form.is_completed === "true",
      };

      if (batch) {
        await updateBatch({ id: batch.id, ...payload }).unwrap();
        toast.success("تم تعديل الشعبة بنجاح");
      } else {
        await addBatch(payload).unwrap();
        toast.success("تم إضافة الشعبة بنجاح");
      }

      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {batch ? "تعديل شعبة" : "إضافة شعبة جديدة"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        {/* Form */}
        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم الشعبة"
            required
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
              setForm({
                ...form,
                institute_branch_id: e.target.value,
                class_room_id: "", // reset room
              })
            }
            options={branches.map((b) => ({
              value: b.id,
              label: b.name,
            }))}
          />

          <SelectInput
            label="الفرع الأكاديمي"
            required
            value={form.academic_branch_id}
            onChange={(e) =>
              setForm({
                ...form,
                academic_branch_id: e.target.value,
              })
            }
            options={academicBranches.map((a) => ({
              value: a.id,
              label: a.name,
            }))}
          />

          <SelectInput
            label="القاعة"
            required
            value={form.class_room_id}
            onChange={(e) =>
              setForm({
                ...form,
                class_room_id: e.target.value,
              })
            }
            options={classRooms.map((r) => ({
              value: r.id,
              label: r.name,
            }))}
          />

          <SelectInput
            label="الجنس"
            required
            value={form.gender_type}
            onChange={(e) => setForm({ ...form, gender_type: e.target.value })}
            options={[
              { value: "male", label: "ذكور" },
              { value: "female", label: "إناث" },
            ]}
          />

          <FormInput
            type="date"
            label="تاريخ البداية"
            value={form.start_date}
            register={{
              onChange: (e) => setForm({ ...form, start_date: e.target.value }),
            }}
          />

          <FormInput
            type="date"
            label="تاريخ النهاية"
            value={form.end_date}
            register={{
              onChange: (e) => setForm({ ...form, end_date: e.target.value }),
            }}
          />

          <SelectInput
            label="مؤرشفة؟"
            value={form.is_archived}
            onChange={(e) => setForm({ ...form, is_archived: e.target.value })}
            options={[
              { value: "false", label: "لا" },
              { value: "true", label: "نعم" },
            ]}
          />

          <SelectInput
            label="مخفية؟"
            value={form.is_hidden}
            onChange={(e) => setForm({ ...form, is_hidden: e.target.value })}
            options={[
              { value: "false", label: "لا" },
              { value: "true", label: "نعم" },
            ]}
          />

          <SelectInput
            label="مكتملة؟"
            value={form.is_completed}
            onChange={(e) => setForm({ ...form, is_completed: e.target.value })}
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
