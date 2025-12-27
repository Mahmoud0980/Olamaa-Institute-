"use client";

import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import SelectInput from "@/components/common/SelectInput";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import { useAssignTeacherToSubjectMutation } from "@/store/services/subjectsTeachersApi";

export default function EditTeacherSubjectsModal({
  isOpen,
  onClose,
  teacher,
  subjects = [],
}) {
  const [assign, { isLoading }] = useAssignTeacherToSubjectMutation();

  const [selectedSubject, setSelectedSubject] = useState("");

  const handleAdd = async () => {
    if (!selectedSubject) return toast.error("اختر مادة");

    try {
      await assign({
        subject_id: Number(selectedSubject),
        instructor_id: teacher.id,
      }).unwrap();

      toast.success("تم ربط المادة بالأستاذ");
      setSelectedSubject("");
    } catch (e) {
      toast.error(e?.data?.message || "فشل ربط المادة");
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="w-full sm:w-[420px] bg-white h-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">ربط الأستاذ بمادة</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Select Subject */}
        <SelectInput
          label="المادة"
          value={selectedSubject}
          options={subjects.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          onChange={(e) => setSelectedSubject(e.target.value)}
        />

        {/* Action */}
        <StepButtonsSmart
          step={1}
          total={1}
          isEdit
          loading={isLoading}
          onNext={handleAdd}
        />
      </div>
    </div>
  );
}
