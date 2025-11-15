"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  useAddBusMutation,
  useUpdateBusMutation,
} from "@/store/services/busesApi";

export default function AddBusModal({ isOpen, onClose, bus }) {
  const [addBus] = useAddBusMutation();
  const [updateBus] = useUpdateBusMutation();

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    driver_name: "",
    route_description: "",
    is_active: true,
  });

  // ⭐ إعادة ضبط النموذج عند الفتح
  useEffect(() => {
    if (isOpen) {
      if (bus) {
        setForm({
          name: bus.name ?? "",
          capacity: bus.capacity ?? "",
          driver_name: bus.driver_name ?? "",
          route_description: bus.route_description ?? "",
          is_active: bus.is_active ?? true,
        });
      } else {
        setForm({
          name: "",
          capacity: "",
          driver_name: "",
          route_description: "",
          is_active: true,
        });
      }
    }
  }, [isOpen, bus]);

  // ⭐ الحفظ / التعديل
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("اسم الباص مطلوب");
      return;
    }

    if (!form.capacity || form.capacity <= 0) {
      toast.error("السعة مطلوبة ويجب أن تكون رقمًا أكبر من الصفر");
      return;
    }

    try {
      setLoading(true);

      if (bus) {
        await updateBus({ id: bus.id, ...form }).unwrap();
        toast.success("تم تعديل بيانات الباص");
      } else {
        await addBus(form).unwrap();
        toast.success("تم إضافة الباص بنجاح");
      }

      onClose();
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحفظ");
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
            {bus ? "تعديل باص" : "إضافة باص جديد"}
          </h2>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم الباص"
            required
            placeholder="مثال: Bus A"
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
            error={!form.name ? "اسم الباص مطلوب" : ""}
          />

          <FormInput
            label="السعة"
            required
            type="number"
            placeholder="مثال: 40"
            value={form.capacity}
            register={{
              onChange: (e) => setForm({ ...form, capacity: e.target.value }),
            }}
          />
          <FormInput
            label="اسم السائق"
            placeholder="مثال: John Doe"
            value={form.driver_name}
            register={{
              onChange: (e) =>
                setForm({ ...form, driver_name: e.target.value }),
            }}
          />

          <FormInput
            label="وصف الطريق"
            placeholder="مثال: الطريق من A إلى B"
            value={form.route_description}
            register={{
              onChange: (e) =>
                setForm({ ...form, route_description: e.target.value }),
            }}
          />

          <div className="flex flex-col">
            <label className="text-sm text-gray-700 mb-1">الحالة</label>
            <select
              value={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.value === "true" })
              }
              className="border border-gray-300 p-2 rounded"
            >
              <option value="true">نشط</option>
              <option value="false">غير نشط</option>
            </select>
          </div>

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!bus}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
