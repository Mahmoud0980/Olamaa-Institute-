"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import FormInput from "@/components/common/InputField";
import PhoneInput from "@/components/common/PhoneInput";
import SelectInput from "@/components/common/SelectInput";
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
      job_type: employee.job_type ?? "", // ← انتبه
      hire_date: employee.hire_date || "",
      phone: employee.phone || "",
      institute_branch_id: employee.institute_branch_id || "",
      is_active: !!employee.is_active,
    });

    setErrors({});
  }, [employee]);

  const handleSubmit = async () => {
    try {
      await updateEmployee({
        id: employee.id,
        ...form,
      }).unwrap();

      toast.success("تم تعديل بيانات الموظف");
      onClose();
    } catch (e) {
      toast.error("خطأ أثناء التعديل");
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

          <SelectInput
            value={form.job_type}
            options={[
              { value: "supervisor", label: "مشرف" },
              { value: "accountant", label: "محاسب" },
              { value: "coordinator", label: "منسق" },
            ]}
            onChange={(e) => setForm({ ...form, job_type: e.target.value })}
          />

          <FormInput
            label="تاريخ التعيين"
            type="date"
            value={form.hire_date}
            register={{
              onChange: (e) => setForm({ ...form, hire_date: e.target.value }),
            }}
          />

          <PhoneInput
            name="phone"
            setValue={(n, v) => setForm({ ...form, phone: v })}
          />

          <SelectInput
            label="فرع المعهد"
            value={form.institute_branch_id}
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
            onChange={(e) =>
              setForm({ ...form, institute_branch_id: e.target.value })
            }
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_active}
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
