"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import {
  useAddKnowWayMutation,
  useUpdateKnowWayMutation,
} from "@/store/services/knowWaysApi";

import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

export default function AddKnowWayModal({ isOpen, onClose, item }) {
  const [addKnowWay] = useAddKnowWayMutation();
  const [updateKnowWay] = useUpdateKnowWayMutation();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(item?.name || "");
  }, [isOpen, item]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("الاسم مطلوب");

    try {
      setLoading(true);

      if (item) {
        await updateKnowWay({ id: item.id, name }).unwrap();
        toast.success("تم التعديل بنجاح");
      } else {
        await addKnowWay({ name }).unwrap();
        toast.success("تمت الإضافة بنجاح");
      }

      onClose();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
      <div className="w-full sm:w-[400px] bg-white h-full p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {item ? "تعديل طريقة" : "إضافة طريقة"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <FormInput
          label="طريقة المعرفة"
          value={name}
          register={{
            onChange: (e) => setName(e.target.value),
          }}
        />

        <StepButtonsSmart
          step={1}
          total={1}
          loading={loading}
          isEdit={!!item}
          onNext={handleSubmit}
        />
      </div>
    </div>
  );
}
