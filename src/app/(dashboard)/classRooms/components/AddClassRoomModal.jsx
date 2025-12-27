"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import {
  useAddClassRoomMutation,
  useUpdateClassRoomMutation,
} from "@/store/services/classRoomsApi";

import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

export default function AddClassRoomModal({ isOpen, onClose, item }) {
  const [addRoom] = useAddClassRoomMutation();
  const [updateRoom] = useUpdateClassRoomMutation();

  const [form, setForm] = useState({
    name: "",
    code: "",
    capacity: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setForm({
        name: item.name || "",
        code: item.code || "",
        capacity: item.capacity || "",
        notes: item.notes || "",
      });
    } else {
      setForm({
        name: "",
        code: "",
        capacity: "",
        notes: "",
      });
    }
  }, [isOpen, item]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("اسم القاعة مطلوب");

    if (!form.capacity) return toast.error("السعة مطلوبة");

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        code: form.code,
        capacity: Number(form.capacity),
        notes: form.notes,
      };

      if (item) {
        await updateRoom({ id: item.id, ...payload }).unwrap();
        toast.success("تم تعديل القاعة بنجاح");
      } else {
        await addRoom(payload).unwrap();
        toast.success("تمت إضافة القاعة بنجاح");
      }

      onClose();
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[400px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {item ? "تعديل قاعة" : "إضافة قاعة جديدة"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          <FormInput
            label="اسم القاعة"
            required
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
          />

          <FormInput
            label="الكود"
            value={form.code}
            register={{
              onChange: (e) => setForm({ ...form, code: e.target.value }),
            }}
          />

          <FormInput
            type="number"
            label="السعة"
            required
            value={form.capacity}
            register={{
              onChange: (e) => setForm({ ...form, capacity: e.target.value }),
            }}
          />

          <FormInput
            label="ملاحظات"
            value={form.notes}
            register={{
              onChange: (e) => setForm({ ...form, notes: e.target.value }),
            }}
          />

          <StepButtonsSmart
            step={1}
            total={1}
            isEdit={!!item}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
