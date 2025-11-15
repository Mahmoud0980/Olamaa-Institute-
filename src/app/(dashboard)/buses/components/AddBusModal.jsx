"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SelectInput from "@/components/common/SelectInput";

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
    is_active: "true", // انتبه: لازم string
  });

  // ⭐ عند فتح المودال → جهّز البيانات
  useEffect(() => {
    if (isOpen) {
      if (bus) {
        setForm({
          name: bus.name ?? "",
          capacity: String(bus.capacity ?? ""),
          driver_name: bus.driver_name ?? "",
          route_description: bus.route_description ?? "",
          is_active: bus.is_active ? "true" : "false",
        });
      } else {
        setForm({
          name: "",
          capacity: "",
          driver_name: "",
          route_description: "",
          is_active: "true",
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
      toast.error("السعة مطلوبة ويجب أن تكون أكبر من 0");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        capacity: Number(form.capacity),
        is_active: form.is_active === "true",
      };

      if (bus) {
        await updateBus({ id: bus.id, ...payload }).unwrap();
        toast.success("تم تعديل بيانات الباص");
      } else {
        await addBus(payload).unwrap();
        toast.success("تم إضافة باص جديد");
      }

      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("حدث خطأ أثناء الحفظ");
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
          {/* اسم الباص */}
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

          {/* السعة */}
          <FormInput
            label="السعة"
            type="number"
            required
            placeholder="مثال: 40"
            value={form.capacity}
            register={{
              onChange: (e) => setForm({ ...form, capacity: e.target.value }),
            }}
          />

          {/* اسم السائق */}
          <FormInput
            label="اسم السائق"
            placeholder="مثال: John Doe"
            value={form.driver_name}
            register={{
              onChange: (e) =>
                setForm({ ...form, driver_name: e.target.value }),
            }}
          />

          {/* وصف الطريق */}
          <FormInput
            label="وصف الطريق"
            placeholder="مثال: الطريق من A إلى B"
            value={form.route_description}
            register={{
              onChange: (e) =>
                setForm({ ...form, route_description: e.target.value }),
            }}
          />

          {/* الحالة باستخدام SelectInput */}
          <SelectInput
            label="الحالة"
            required
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.value })}
            options={[
              { value: "true", label: "نشط" },
              { value: "false", label: "غير نشط" },
            ]}
            placeholder="اختر الحالة"
          />

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
