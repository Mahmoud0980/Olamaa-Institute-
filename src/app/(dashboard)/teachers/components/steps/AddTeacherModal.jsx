"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";
import PhoneInput from "@/components/common/PhoneInput";
import DatePickerSmart from "@/components/common/DatePickerSmart";

import {
  useAddTeacherMutation,
  useGetTeacherBatchesDetailsQuery,
} from "@/store/services/teachersApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

import TeacherSubjectsStep from "./TeacherSubjectsStep";
import TeacherBatchesStep from "./TeacherBatchesStep";

function extractTeacherFromResponse(res) {
  const t1 = res?.data;
  const t2 = res?.data?.data;
  const teacher = t1 && t1.id ? t1 : t2 && t2.id ? t2 : null;
  return teacher;
}

export default function AddTeacherModal({ isOpen, onClose }) {
  const [addTeacher] = useAddTeacherMutation();

  const { data: branchesData, isFetching: fetchingBranches } =
    useGetInstituteBranchesQuery(undefined, {
      skip: !isOpen,
      refetchOnMountOrArgChange: true,
    });

  const branches = branchesData?.data || [];

  const [step, setStep] = useState(1);
  const total = 3;

  const [loadingCreate, setLoadingCreate] = useState(false);

  const [createdTeacher, setCreatedTeacher] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    hire_date: "",
    institute_branch_id: "",
  });

  const teacherId = createdTeacher?.id;

  const { data: linkedSubjectsRes } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !isOpen || !teacherId || step < 2 },
  );

  const linkedSubjectsCount = useMemo(
    () => (linkedSubjectsRes?.data?.length ? linkedSubjectsRes.data.length : 0),
    [linkedSubjectsRes],
  );

  const resetAll = () => {
    setStep(1);
    setLoadingCreate(false);
    setCreatedTeacher(null);
    setForm({
      name: "",
      phone: "",
      specialization: "",
      hire_date: "",
      institute_branch_id: "",
    });
  };

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen]);

  const validateTeacher = () => {
    if (!form.name.trim()) return "اسم الأستاذ مطلوب";
    if (!form.phone) return "رقم الهاتف مطلوب";
    if (!form.specialization.trim()) return "الاختصاص مطلوب";
    if (!form.hire_date) return "تاريخ التعيين مطلوب";
    if (!form.institute_branch_id) return "الفرع مطلوب";
    return null;
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleNext = async () => {
    if (step === 1) {
      const error = validateTeacher();
      if (error) return notify.error(error);

      try {
        setLoadingCreate(true);

        const payload = {
          ...form,
          institute_branch_id: Number(form.institute_branch_id),
        };

        const res = await addTeacher(payload).unwrap();

        const newTeacher = extractTeacherFromResponse(res) || {
          id: res?.data?.id || res?.id,
          name: form.name,
          ...res?.data,
        };

        if (!newTeacher?.id) {
          notify.error("تمت الإضافة لكن لم يتم استلام ID من السيرفر");
          return;
        }

        setCreatedTeacher(newTeacher);
        notify.success("تم إضافة الأستاذ بنجاح");
        setStep(2);
      } catch (e) {
        notify.error(e?.data?.message || "فشل الإضافة");
      } finally {
        setLoadingCreate(false);
      }
      return;
    }

    if (step === 2) {
      if (!teacherId) return notify.error("لا يوجد Teacher ID");
      if (linkedSubjectsCount === 0) {
        return notify.error(
          "اربط مادة واحدة على الأقل قبل الانتقال لتخصيص الشعب",
        );
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      notify.success("تمت العملية بنجاح");
      handleClose();
    }
  };

  const handleBack = () => {
    if (step === 2) return setStep(1);
    if (step === 3) return setStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-[#6F013F] font-semibold">إضافة أستاذ</h2>
            {createdTeacher?.id ? (
              <p className="text-xs text-gray-500 mt-1">
                ID: {createdTeacher.id} — {createdTeacher?.name || form.name}
              </p>
            ) : null}
          </div>

          <button onClick={handleClose} type="button">
            <X />
          </button>
        </div>

        <Stepper current={step} total={total} />

        {step === 1 && (
          <div className="mt-6 space-y-5">
            <FormInput
              label="اسم الأستاذ"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <PhoneInput
              name="phone"
              value={form.phone}
              setValue={(name, value) => setForm({ ...form, phone: value })}
            />

            <FormInput
              label="الاختصاص"
              required
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
            />

            <DatePickerSmart
              label="تاريخ التعيين"
              required
              value={form.hire_date}
              onChange={(iso) => setForm({ ...form, hire_date: iso })}
              placeholder="dd/mm/yyyy"
            />

            <SearchableSelect
              label="فرع المعهد"
              required
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

            <StepButtonsSmart
              step={step}
              total={total}
              loading={loadingCreate}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <TeacherSubjectsStep teacher={createdTeacher} />
            <div className="mt-6">
              <StepButtonsSmart
                step={step}
                total={total}
                isEdit
                loading={false}
                onNext={handleNext}
                onBack={handleBack}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6">
            <TeacherBatchesStep teacher={createdTeacher} />
            <div className="mt-6">
              <StepButtonsSmart
                step={step}
                total={total}
                isEdit
                loading={false}
                onNext={handleNext}
                onBack={handleBack}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
