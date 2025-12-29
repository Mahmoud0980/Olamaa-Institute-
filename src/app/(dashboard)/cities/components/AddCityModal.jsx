"use client";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";

import {
  useAddCityMutation,
  useUpdateCityMutation,
} from "@/store/services/citiesApi";

export default function AddCityModal({ isOpen, onClose, city, cities = [] }) {
  const [addCity] = useAddCityMutation();
  const [updateCity] = useUpdateCityMutation();

  const [loading, setLoading] = useState(false);
  const step = 1;
  const total = 1;

  const [form, setForm] = useState({ name: "", description: "" });
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm(
        city
          ? { name: city.name, description: city.description || "" }
          : { name: "", description: "" }
      );
    }
  }, [isOpen, city]);

  const cityNames = useMemo(
    () =>
      cities
        .filter((c) => !city || c.id !== city.id)
        .map((c) => c.name.toLowerCase().trim()),
    [cities, city]
  );

  useEffect(() => {
    const v = form.name.trim().toLowerCase();

    if (!v) {
      if (suggestions.length !== 0) {
        setSuggestions([]);
      }
      return;
    }

    const matches = cities
      .filter(
        (c) => c.name.toLowerCase().includes(v) && (!city || c.id !== city.id)
      )
      .slice(0, 5);

    setSuggestions(matches);
  }, [form.name, cities, city]); // ❗️لاحظ: بدون suggestions هنا

  const handleSubmit = async () => {
    const normalized = form.name.trim().toLowerCase();

    if (!normalized) {
      toast.error("اسم المدينة مطلوب");
      return;
    }

    if (cityNames.includes(normalized)) {
      toast.error("هذه المدينة موجودة مسبقاً");
      return;
    }

    try {
      setLoading(true);
      city
        ? await updateCity({ id: city.id, ...form }).unwrap()
        : await addCity(form).unwrap();

      toast.success(city ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
      onClose();
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${isOpen ? "flex" : "hidden"} fixed inset-0 bg-black/40 z-50`}
    >
      <div className="w-[500px] bg-white h-full p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {city ? "تعديل مدينة" : "إضافة مدينة"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <div className="relative">
            <FormInput
              label="اسم المدينة"
              required
              value={form.name}
              register={{
                onChange: (e) => setForm({ ...form, name: e.target.value }),
              }}
            />

            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white border rounded-xl shadow z-50">
                {suggestions.map((c) => (
                  <button
                    key={c.id}
                    className="w-full px-3 py-2 text-right hover:bg-pink-50"
                    onClick={() => {
                      setForm({ ...form, name: c.name });
                      setSuggestions([]);
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <FormInput
            label="الوصف"
            value={form.description}
            register={{
              onChange: (e) =>
                setForm({ ...form, description: e.target.value }),
            }}
          />

          <StepButtonsSmart
            step={step}
            total={total}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
