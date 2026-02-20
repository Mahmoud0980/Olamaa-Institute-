"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import {
  useAddKnowWayMutation,
  useUpdateKnowWayMutation,
} from "@/store/services/knowWaysApi";

import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

export default function AddKnowWayModal({ isOpen, onClose, item, allNames }) {
  const [addKnowWay] = useAddKnowWayMutation();
  const [updateKnowWay] = useUpdateKnowWayMutation();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(item?.name || "");
  }, [isOpen, item]);

  const handleSubmit = async () => {
    if (!name.trim()) return notify.error("الاسم مطلوب");
    if (name.length > 50) return notify.error("الاسم طويل");
    // تحقق من التكرار (تجاهل حالة التعديل لنفس العنصر)
    const isDuplicate = allNames
      .filter((n) => !item || n !== item.name)
      .map((n) => n.trim().toLowerCase())
      .includes(name.trim().toLowerCase());
    if (isDuplicate) return notify.error("الاسم مكرر");

    try {
      setLoading(true);

      if (item) {
        await updateKnowWay({ id: item.id, name }).unwrap();
        notify.success("تم التعديل بنجاح");
      } else {
        await addKnowWay({ name }).unwrap();
        notify.success("تمت الإضافة بنجاح");
      }

      onClose();
    } catch {
      notify.error("حدث خطأ");
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
          onChange={(e) => setName(e.target.value)}
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
