"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import FormInput from "@/components/common/InputField";
import SelectInput from "@/components/common/SelectInput";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import PhoneInput from "@/components/common/PhoneInput";

import {
  useAddInstituteBranchMutation,
  useUpdateInstituteBranchMutation,
} from "@/store/services/instituteBranchesApi";

export default function AddInstituteBranchModal({
  isOpen,
  onClose,
  branch, // null = add | object = edit
}) {
  const [addBranch] = useAddInstituteBranchMutation();
  const [updateBranch] = useUpdateInstituteBranchMutation();

  // ===== Form =====
  const initialForm = {
    name: "",
    code: "",
    address: "",
    phone: "",
    email: "",
    manager_name: "",
    is_active: "true",
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  // stepper (خطوة واحدة)
  const step = 1;
  const total = 1;

  // ===== Fill form on edit =====
  useEffect(() => {
    if (!isOpen) return;

    if (branch) {
      setForm({
        name: branch.name ?? "",
        code: branch.code ?? "",
        address: branch.address ?? "",
        phone: branch.phone ?? "",
        email: branch.email ?? "",
        manager_name: branch.manager_name ?? "",
        is_active: branch.is_active ? "true" : "false",
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, branch]);

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("اسم الفرع مطلوب");

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        code: form.code || null,
        address: form.address || null,
        phone: form.phone?.replace("+", ""),
        email: form.email || null,
        manager_name: form.manager_name || null,
        is_active: form.is_active === "true" ? 1 : 0,
      };

      if (branch) {
        await updateBranch({ id: branch.id, ...payload }).unwrap();
        toast.success("تم تعديل الفرع بنجاح");
      } else {
        await addBranch(payload).unwrap();
        toast.success("تم إضافة الفرع بنجاح");
      }

      onClose();
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#6F013F] font-semibold">
            {branch ? "تعديل فرع" : "إضافة فرع جديد"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <div className="space-y-5">
          <FormInput
            label="اسم الفرع"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <FormInput
            label="كود الفرع"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />

          {/* ✅ PhoneInputSimple */}
          <PhoneInput
            name="phone"
            value={form.phone}
            setValue={(key, val) =>
              setForm((prev) => ({ ...prev, [key]: val }))
            }
          />
          <FormInput
            label="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <FormInput
            label="اسم المدير"
            value={form.manager_name}
            onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
          />

          <FormInput
            label="العنوان"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <SelectInput
            label="الحالة"
            value={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.value })}
            options={[
              { value: "true", label: "نشط" },
              { value: "false", label: "غير نشط" },
            ]}
          />

          {/* ================= ACTIONS ================= */}
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!branch}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
