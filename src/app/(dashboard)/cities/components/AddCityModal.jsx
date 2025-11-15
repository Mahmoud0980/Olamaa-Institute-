"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  useAddCityMutation,
  useUpdateCityMutation,
} from "@/store/services/citiesApi";

export default function AddCityModal({ isOpen, onClose, city }) {
  const [addCity] = useAddCityMutation();
  const [updateCity] = useUpdateCityMutation();

  const [loading, setLoading] = useState(false);

  // خطوة واحدة فقط
  const step = 1;
  const total = 1;

  // البيانات
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // ⭐ إعادة ضبط البيانات عند فتح المودال (إضافة / تعديل)
  useEffect(() => {
    if (isOpen) {
      if (city) {
        setForm({
          name: city.name,
          description: city.description || "",
        });
      } else {
        setForm({
          name: "",
          description: "",
        });
      }
    }
  }, [isOpen, city]);

  // ⭐ حفظ / تعديل المدينة
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("اسم المدينة مطلوب");
      return;
    }

    try {
      setLoading(true);

      if (city) {
        await updateCity({ id: city.id, ...form }).unwrap();
        toast.success("تم تعديل المدينة بنجاح");
      } else {
        await addCity(form).unwrap();
        toast.success("تم حفظ المدينة بنجاح");
      }

      // إعادة تصفير
      setForm({
        name: "",
        description: "",
      });

      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("حدث خطأ أثناء حفظ البيانات");
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
            {city ? "تعديل مدينة" : "إضافة مدينة جديدة"}
          </h2>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Stepper */}
        <Stepper current={step} total={total} />

        {/* Form */}
        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم المدينة"
            required
            placeholder="مثال: دمشق"
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
            error={!form.name ? "اسم المدينة مطلوب" : ""}
          />

          <FormInput
            label="الوصف"
            placeholder="وصف اختياري"
            value={form.description}
            register={{
              onChange: (e) =>
                setForm({ ...form, description: e.target.value }),
            }}
          />

          {/* الأزرار الذكية */}
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!city}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
