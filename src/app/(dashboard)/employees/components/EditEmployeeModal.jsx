"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import FormInput from "@/components/common/InputField";
import PhoneInput from "@/components/common/PhoneInput";
import SearchableSelect from "@/components/common/SearchableSelect";

import { useUpdateEmployeeMutation } from "@/store/services/employeesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function EditEmployeeModal({ isOpen, onClose, employee }) {
  const [updateEmployee] = useUpdateEmployeeMutation();
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const [form, setForm] = useState({});

  useEffect(() => {
    if (!employee) return;

    setForm({
      first_name: employee.first_name || "",
      last_name: employee.last_name || "",
      job_title: employee.job_title || "",
      job_type: employee.job_type ?? "",
      hire_date: employee.hire_date || "",
      phone: employee.phone || "",
      institute_branch_id: employee.institute_branch_id || "",
      is_active: !!employee.is_active,
    });
  }, [employee]);

  const handleSubmit = async () => {
    try {
      await updateEmployee({
        id: employee.id,
        ...form,
      }).unwrap();

      notify.success("تم تعديل بيانات الموظف");
      onClose();
    } catch (e) {
      notify.error("خطأ أثناء التعديل");
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 w-full max-w-xl rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#6F013F]">
            تعديل بيانات الموظف
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <FormInput
            label="الاسم"
            value={form.first_name}
            register={{
              onChange: (e) => setForm({ ...form, first_name: e.target.value }),
            }}
          />

          <FormInput
            label="الكنية"
            value={form.last_name}
            register={{
              onChange: (e) => setForm({ ...form, last_name: e.target.value }),
            }}
          />

          <FormInput
            label="الوظيفة"
            value={form.job_title}
            register={{
              onChange: (e) => setForm({ ...form, job_title: e.target.value }),
            }}
          />

          {/* ✅ job_type as searchable */}
          <SearchableSelect
            label="نوع الوظيفة"
            value={form.job_type}
            placeholder="اختر نوع الوظيفة..."
            options={[
              { value: "supervisor", label: "مشرف" },
              { value: "accountant", label: "محاسب" },
              { value: "coordinator", label: "منسق" },
            ]}
            onChange={(val) => setForm({ ...form, job_type: val })}
          />

          <FormInput
            label="تاريخ التعيين"
            type="date"
            value={form.hire_date}
            register={{
              onChange: (e) => setForm({ ...form, hire_date: e.target.value }),
            }}
          />

          {/* ✅ keep your PhoneInput; just make sure it feeds the form */}
          <PhoneInput
            name="phone"
            setValue={(n, v) => setForm({ ...form, phone: v })}
          />

          {/* ✅ institute branch as searchable */}
          <SearchableSelect
            label="فرع المعهد"
            value={form.institute_branch_id}
            placeholder="ابحث عن فرع..."
            options={branches.map((b, idx) => ({
              key: b.id ?? `${b.name}-${idx}`, // احتياط للـ key
              value: b.id,
              label: b.name,
            }))}
            onChange={(val) => setForm({ ...form, institute_branch_id: val })}
            allowClear
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            <span>الموظف نشط</span>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-[#6F013F] text-white rounded-lg"
          >
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
}
