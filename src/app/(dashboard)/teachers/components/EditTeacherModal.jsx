"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInputEdit from "@/components/common/PhoneInputEdit";

import { useUpdateTeacherMutation } from "@/store/services/teachersApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function EditTeacherModal({ isOpen, onClose, teacher }) {
  const [updateTeacher] = useUpdateTeacherMutation();
  const { data: branchesData, isFetching: fetchingBranches } =
    useGetInstituteBranchesQuery(undefined, {
      skip: !isOpen,
      refetchOnMountOrArgChange: true,
    });

  const branches = branchesData?.data || [];

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    hire_date: "",
    institute_branch_id: "",
  });

  /* ✅ تعبئة البيانات كاملة */
  useEffect(() => {
    if (!isOpen || !teacher) return;

    setForm({
      name: teacher.name || "",
      phone: teacher.phone || "",
      specialization: teacher.specialization || "",
      hire_date: teacher.hire_date || "",
      institute_branch_id: teacher.institute_branch?.id || "",
    });
  }, [isOpen, teacher]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await updateTeacher({
        id: teacher.id,
        ...form,
        institute_branch_id: Number(form.institute_branch_id),
      }).unwrap();

      notify.success("تم تعديل بيانات الأستاذ");
      onClose();
    } catch (e) {
      notify.error(e?.data?.message || "فشل التعديل");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-start">
      <div className="w-full sm:w-[460px] bg-white h-full p-6 overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold text-[#6F013F]">تعديل بيانات الأستاذ</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <Stepper current={1} total={1} />

        <div className="mt-6 space-y-5">
          <FormInput
            label="اسم الأستاذ"
            value={form.name}
            register={{
              onChange: (e) => setForm({ ...form, name: e.target.value }),
            }}
          />

          <PhoneInputEdit
            value={form.phone}
            setValue={(n, v) => setForm({ ...form, phone: v })}
          />

          <FormInput
            label="الاختصاص"
            value={form.specialization}
            register={{
              onChange: (e) =>
                setForm({ ...form, specialization: e.target.value }),
            }}
          />

          <FormInput
            type="date"
            label="تاريخ التعيين"
            value={form.hire_date}
            register={{
              onChange: (e) => setForm({ ...form, hire_date: e.target.value }),
            }}
          />

          <SearchableSelect
            label="فرع المعهد"
            value={form.institute_branch_id}
            options={branches.map((b, idx) => ({
              value: String(b.id),
              label: b.name,
              key: `branch-${b.id}-${idx}`,
            }))}
            placeholder={
              fetchingBranches ? "جاري تحميل الفروع..." : "اختر الفرع..."
            }
            disabled={fetchingBranches}
            onChange={(val) => setForm({ ...form, institute_branch_id: val })}
          />

          <StepButtonsSmart isEdit loading={loading} onNext={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
