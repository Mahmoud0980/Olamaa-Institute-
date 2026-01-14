"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect"; // ✅

import {
  useAddSchoolMutation,
  useUpdateSchoolMutation,
} from "@/store/services/schoolsApi";

import { useGetCitiesQuery } from "@/store/services/citiesApi"; // ✅

export default function AddSchoolModal({ isOpen, onClose, school }) {
  const [addSchool] = useAddSchoolMutation();
  const [updateSchool] = useUpdateSchoolMutation();

  // ✅ Cities
  const { data: citiesData, isLoading: citiesLoading } = useGetCitiesQuery();
  const cities = citiesData?.data || [];

  const cityOptions = useMemo(() => {
    const map = new Map(); // ✅ لمنع تكرار نفس الاسم
    cities.forEach((c) => {
      const name = (c?.name ?? "").trim();
      if (!name) return;
      if (!map.has(name)) {
        map.set(name, { key: c.id, value: name, label: name }); // ✅ key فريد
      }
    });
    return Array.from(map.values());
  }, [cities]);

  // ✅ Type options
  const typeOptions = useMemo(
    () => [
      { value: "public", label: "حكومية" },
      { value: "private", label: "خاصة" },
    ],
    []
  );

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  const [form, setForm] = useState({
    name: "",
    type: "public",
    city: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    if (!isOpen) return;

    if (school) {
      setForm({
        name: school?.name ?? "",
        type: school?.type ?? "public",
        city: school?.city ?? "",
        notes: school?.notes ?? "",
        is_active: !!school?.is_active,
      });
    } else {
      setForm({
        name: "",
        type: "public",
        city: "",
        notes: "",
        is_active: true,
      });
    }
  }, [isOpen, school]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("اسم المدرسة مطلوب");
    if (!form.type?.trim()) return toast.error("نوع المدرسة مطلوب");
    if (!form.city?.trim()) return toast.error("المدينة مطلوبة");

    try {
      setLoading(true);

      // ✅ ملاحظة: حسب الـ API تبع المدارس city عبارة عن نص (مثل "دمشق")
      const payload = {
        name: form.name.trim(),
        type: form.type, // public | private
        city: form.city.trim(), // نص
        notes: form.notes?.trim() || "",
        is_active: form.is_active ? 1 : 0,
      };
      console.log("SCHOOL PAYLOAD", payload);

      if (school) {
        await updateSchool({ id: school.id, ...payload }).unwrap();
        toast.success("تم تعديل المدرسة");
      } else {
        await addSchool(payload).unwrap();
        toast.success("تم إضافة المدرسة بنجاح");
      }

      onClose();
    } catch (err) {
      console.error("❌ ADD SCHOOL ERROR:", err);
      console.error("❌ ERROR DATA:", err?.data);
      console.error("❌ ERROR MESSAGE:", err?.data?.message);
      console.error("❌ ERROR ERRORS:", err?.data?.errors);

      toast.error(err?.data?.message || "فشل الإرسال (422) – تحقق من الكونسول");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 justify-start z-50 backdrop-blur-md flex">
      <div className="w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {school ? "تعديل مدرسة" : "إضافة مدرسة"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم المدرسة"
            required
            placeholder="مثال: ثانوية ابن رشد"
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
          />

          {/* ✅ TYPE (SearchableSelect) */}
          <SearchableSelect
            label="نوع المدرسة"
            required
            value={form.type}
            onChange={(v) => setForm({ ...form, type: v })}
            options={typeOptions}
            placeholder="اختر النوع..."
            allowClear={false}
          />

          {/* ✅ CITY (SearchableSelect) from API */}
          <SearchableSelect
            label="المدينة"
            required
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
            options={cityOptions}
            placeholder={
              citiesLoading ? "جارِ تحميل المدن..." : "اختر المدينة..."
            }
            disabled={citiesLoading}
            allowClear
          />

          <FormInput
            label="ملاحظات"
            placeholder="مثال: مدرسة حكومية"
            value={form.notes}
            register={{
              onChange: (e) => setForm({ ...form, notes: e.target.value }),
            }}
          />

          {/* ACTIVE */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-700">الحالة</span>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#6F013F]"
                checked={!!form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <span className="text-sm text-gray-600">
                {form.is_active ? "مفعلة" : "متوقفة"}
              </span>
            </label>
          </div>

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!school}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
