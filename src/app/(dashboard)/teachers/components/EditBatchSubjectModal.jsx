"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import { useUpdateBatchSubjectMutation } from "@/store/services/batcheSubjectsApi";

// ✅ هذا المودال حالياً لتعديل notes لتخصيص (batch_subject)
// لاحقاً إذا بدك "ربط شعبة" فعلياً بدنا endpoint جديد للإضافة
export default function EditBatchSubjectModal({ isOpen, onClose, item }) {
  const [update, { isLoading }] = useUpdateBatchSubjectMutation();

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setNotes(item?.notes || "");
  }, [isOpen, item]);

  const handleSubmit = async () => {
    try {
      await update({
        id: item.id,
        instructor_subject_id: item.id,
        notes,
      }).unwrap();

      toast.success("تم التعديل");
      onClose();
    } catch (e) {
      toast.error(e?.data?.message || "فشل التعديل");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="w-full sm:w-[420px] bg-white h-full p-6 shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            تعديل تخصيص مادة لدورة
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <FormInput
          label="ملاحظات"
          value={notes}
          register={{
            onChange: (e) => setNotes(e.target.value),
          }}
        />

        <StepButtonsSmart
          step={1}
          total={1}
          isEdit
          loading={isLoading}
          onNext={handleSubmit}
        />
      </div>
    </div>
  );
}
