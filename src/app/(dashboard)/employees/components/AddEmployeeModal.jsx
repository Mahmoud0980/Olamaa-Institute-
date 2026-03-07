"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import PhoneInput from "@/components/common/PhoneInput";
import SearchableSelect from "@/components/common/SearchableSelect";
import DatePickerSmart from "@/components/common/DatePickerSmart";

import {
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
} from "@/store/services/employeesApi";

import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function AddEmployeeModal({ isOpen, onClose, employee }) {
  const [addEmployee] = useAddEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();

  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const [loading, setLoading] = useState(false);

  const step = 1;
  const total = 1;

  const initialForm = {
    first_name: "",
    last_name: "",
    job_title: "",
    job_type: "",
    hire_date: "",
    phone: "",
    institute_branch_id: "",
    is_active: true,
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) return;

    if (employee) {
      setForm({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        job_title: employee.job_title || "",
        job_type: employee.job_type ?? "",
        hire_date: employee.hire_date || "",
        phone: employee.phone || "",
        institute_branch_id: employee.institute_branch_id ?? "",
        is_active: !!employee.is_active,
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, employee]);

  const validate = () => {
    if (!form.first_name.trim()) return "الاسم مطلوب";
    if (!form.last_name.trim()) return "الكنية مطلوبة";
    if (!form.job_title.trim()) return "المسمى الوظيفي مطلوب";
    if (!form.job_type) return "نوع الوظيفة مطلوب";
    if (!form.hire_date) return "تاريخ التعيين مطلوب";
    if (!form.phone) return "رقم الهاتف مطلوب";
    if (!form.institute_branch_id) return "فرع المعهد مطلوب";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) return notify.error(error);

    try {
      setLoading(true);

      const payload = {
        ...form,
        institute_branch_id: Number(form.institute_branch_id),
      };

      if (employee) {
        await updateEmployee({ id: employee.id, ...payload }).unwrap();
        notify.success("تم تعديل الموظف بنجاح");
      } else {
        await addEmployee(payload).unwrap();
        notify.success("تم إضافة الموظف بنجاح");
      }

      onClose();
    } catch (err) {
      console.error(err);
      notify.error("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[500px] bg-white h-full shadow-xl flex flex-col">
        {/* Header ثابت */}
        <div className="shrink-0 border-b border-gray-100 px-6 pt-6 pb-4 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#6F013F] font-semibold">
              {employee ? "تعديل موظف" : "إضافة موظف جديد"}
            </h2>
            <button onClick={onClose} type="button">
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <Stepper current={step} total={total} />
        </div>

        {/* المحتوى فقط عليه سكرول */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <FormInput
              label="الاسم"
              required
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />

            <FormInput
              label="الكنية"
              required
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />

            <FormInput
              label="المسمى الوظيفي"
              required
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            />

            <SearchableSelect
              label="نوع الوظيفة"
              required
              value={form.job_type}
              placeholder="اختر نوع الوظيفة..."
              options={[
                { value: "supervisor", label: "مشرف" },
                { value: "accountant", label: "محاسب" },
                { value: "coordinator", label: "منسق" },
              ]}
              onChange={(val) => setForm({ ...form, job_type: val })}
            />

            <DatePickerSmart
              label="تاريخ التعيين"
              required
              value={form.hire_date}
              onChange={(iso) => setForm({ ...form, hire_date: iso })}
              placeholder="dd/mm/yyyy"
            />

            <PhoneInput
              name="phone"
              value={form.phone}
              defaultCountry="SY"
              setValue={(n, v) => setForm({ ...form, phone: v })}
            />

            <SearchableSelect
              label="فرع المعهد"
              required
              value={String(form.institute_branch_id || "")}
              placeholder="ابحث عن فرع..."
              options={branches.map((b, idx) => ({
                key: b.id ?? `${b.name}-${idx}`,
                value: String(b.id),
                label: b.name,
              }))}
              onChange={(val) =>
                setForm({
                  ...form,
                  institute_branch_id: val,
                })
              }
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#6F013F]"
                checked={!!form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <label className="text-sm text-gray-700">الموظف نشط</label>
            </div>
          </div>
        </div>

        {/* Footer ثابت */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!employee}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
