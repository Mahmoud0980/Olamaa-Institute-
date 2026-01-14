"use client";

import { useState, useEffect, useMemo } from "react";
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

export default function AddBusModal({ isOpen, onClose, bus, buses = [] }) {
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
    is_active: "true",
  });

  const [suggestions, setSuggestions] = useState([]);

  // ===== عند الفتح
  useEffect(() => {
    if (isOpen) {
      setForm(
        bus
          ? {
              name: bus.name ?? "",
              capacity: String(bus.capacity ?? ""),
              driver_name: bus.driver_name ?? "",
              route_description: bus.route_description ?? "",
              is_active: bus.is_active ? "true" : "false",
            }
          : {
              name: "",
              capacity: "",
              driver_name: "",
              route_description: "",
              is_active: "true",
            }
      );
      setSuggestions([]);
    }
  }, [isOpen, bus]);

  // ===== أسماء الباصات (للتحقق عند الحفظ فقط)
  const busNames = useMemo(
    () =>
      buses
        .filter((b) => !bus || b.id !== bus.id)
        .map((b) => b.name?.toLowerCase().trim()),
    [buses, bus]
  );

  // ===== اقتراحات (نفس منطق وتصميم المدينة)
  useEffect(() => {
    const v = form.name.trim().toLowerCase();
    if (!v) return setSuggestions([]);

    setSuggestions(
      buses
        .filter(
          (b) =>
            b.name &&
            b.name.toLowerCase().includes(v) &&
            (!bus || b.id !== bus.id)
        )
        .slice(0, 5)
    );
  }, [form.name, buses, bus]);

  // ===== حفظ / تعديل
  const handleSubmit = async () => {
    const normalized = form.name.trim().toLowerCase();

    if (!normalized) {
      toast.error("اسم الباص مطلوب");
      return;
    }

    if (busNames.includes(normalized)) {
      toast.error("اسم الباص موجود مسبقًا");
      return;
    }

    if (!form.capacity || Number(form.capacity) <= 0) {
      toast.error("السعة مطلوبة");
      return;
    }

    if (Number(form.capacity) > 40) {
      toast.error("السعة لا يمكن أن تكون أكبر من 40");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        capacity: Number(form.capacity),
        is_active: form.is_active === "true",
      };

      bus
        ? await updateBus({ id: bus.id, ...payload }).unwrap()
        : await addBus(payload).unwrap();

      toast.success(bus ? "تم تعديل بيانات الباص" : "تم إضافة باص جديد");
      onClose();
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } fixed inset-0 bg-black/40 justify-start z-50`}
    >
      <div className="w-[500px] bg-white h-full p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {bus ? "تعديل باص" : "إضافة باص جديد"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          {/* ===== اسم الباص + اقتراحات ===== */}
          <div className="relative">
            <FormInput
              label="اسم الباص"
              required
              placeholder="مثال: Bus A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white border rounded-xl shadow z-50">
                {suggestions.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="w-full px-3 py-2 text-right hover:bg-pink-50"
                    onClick={() => {
                      setForm({ ...form, name: b.name });
                      setSuggestions([]);
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* السعة */}
          <FormInput
            label="السعة"
            type="number"
            required
            placeholder="مثال: 30"
            value={form.capacity}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > 40) {
                toast.error("الحد الأقصى للسعة هو 40");
                return;
              }
              setForm({ ...form, capacity: e.target.value });
            }}
          />

          {/* اسم السائق */}
          <FormInput
            label="اسم السائق"
            placeholder="مثال: John Doe"
            value={form.driver_name}
            onChange={(e) => setForm({ ...form, driver_name: e.target.value })}
          />

          {/* وصف الطريق */}
          <FormInput
            label="وصف الطريق"
            placeholder="مثال: الطريق من A إلى B"
            value={form.route_description}
            onChange={(e) =>
              setForm({ ...form, route_description: e.target.value })
            }
          />

          {/* الحالة */}
          <SelectInput
            label="الحالة"
            required
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.value })}
            options={[
              { value: "true", label: "نشط" },
              { value: "false", label: "غير نشط" },
            ]}
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
