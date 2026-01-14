"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SelectInput from "@/components/common/SelectInput";
import PhoneInput from "@/components/common/PhoneInput";

import {
  useAddTeacherMutation,
  useGetTeacherBatchesDetailsQuery,
} from "@/store/services/teachersApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

import TeacherSubjectsStep from "./TeacherSubjectsStep";
import TeacherBatchesStep from "./TeacherBatchesStep";

function extractTeacherFromResponse(res) {
  // احتمالات شائعة:
  // {data: {id, ...}}
  // {data: {data: {id, ...}}}
  const t1 = res?.data;
  const t2 = res?.data?.data;
  const teacher = t1 && t1.id ? t1 : t2 && t2.id ? t2 : null;

  return teacher;
}

export default function AddTeacherModal({ isOpen, onClose }) {
  const [addTeacher] = useAddTeacherMutation();

  const { data: branchesData } = useGetInstituteBranchesQuery(undefined, {
    skip: !isOpen,
  });
  const branches = branchesData?.data || [];

  const [step, setStep] = useState(1);
  const total = 3;

  const [loadingCreate, setLoadingCreate] = useState(false);

  // بعد الإنشاء
  const [createdTeacher, setCreatedTeacher] = useState(null); // {id, name, ...}

  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    hire_date: "",
    institute_branch_id: "",
  });

  const teacherId = createdTeacher?.id;

  // ✅ مواد الأستاذ المربوطة (لنمنع الانتقال للخطوة 3 إذا ما في مواد)
  const { data: linkedSubjectsRes } = useGetTeacherBatchesDetailsQuery(
    teacherId ? { id: teacherId, type: "subjects" } : undefined,
    { skip: !isOpen || !teacherId || step < 2 }
  );

  const linkedSubjectsCount = useMemo(
    () => (linkedSubjectsRes?.data?.length ? linkedSubjectsRes.data.length : 0),
    [linkedSubjectsRes]
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
    // ===== Step 1: Create Teacher =====
    if (step === 1) {
      const error = validateTeacher();
      if (error) return toast.error(error);

      try {
        setLoadingCreate(true);

        const payload = {
          ...form,
          institute_branch_id: Number(form.institute_branch_id),
        };

        const res = await addTeacher(payload).unwrap();

        const newTeacher = extractTeacherFromResponse(res) || {
          id: res?.data?.id || res?.id, // احتياط
          name: form.name,
          ...res?.data,
        };

        if (!newTeacher?.id) {
          toast.error("تمت الإضافة لكن لم يتم استلام ID من السيرفر");
          return;
        }

        setCreatedTeacher(newTeacher);
        toast.success("تم إضافة الأستاذ بنجاح");
        setStep(2);
      } catch (e) {
        toast.error(e?.data?.message || "فشل الإضافة");
      } finally {
        setLoadingCreate(false);
      }
      return;
    }

    // ===== Step 2: Must have at least 1 subject =====
    if (step === 2) {
      if (!teacherId) return toast.error("لا يوجد Teacher ID");
      if (linkedSubjectsCount === 0) {
        return toast.error(
          "اربط مادة واحدة على الأقل قبل الانتقال لتخصيص الشعب"
        );
      }
      setStep(3);
      return;
    }

    // ===== Step 3: Finish =====
    if (step === 3) {
      toast.success("تمت العملية بنجاح");
      handleClose();
    }
  };

  const handleBack = () => {
    // ممنوع ترجع للخطوة 1 بعد إنشاء أستاذ (لتفادي تعقيد تعديل البيانات)
    if (step === 2) return setStep(1);
    if (step === 3) return setStep(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-[#6F013F] font-semibold">
              إضافة أستاذ (خطوات)
            </h2>
            {createdTeacher?.id ? (
              <p className="text-xs text-gray-500 mt-1">
                ID: {createdTeacher.id} — {createdTeacher?.name || form.name}
              </p>
            ) : null}
          </div>

          <button onClick={handleClose}>
            <X />
          </button>
        </div>

        <Stepper current={step} total={total} />

        {/* ===== Step 1 ===== */}
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

            <FormInput
              type="date"
              label="تاريخ التعيين"
              required
              value={form.hire_date}
              onChange={(e) => setForm({ ...form, hire_date: e.target.value })}
            />

            <SelectInput
              label="فرع المعهد"
              required
              value={form.institute_branch_id}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              onChange={(e) =>
                setForm({ ...form, institute_branch_id: e.target.value })
              }
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

        {/* ===== Step 2 ===== */}
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
              <p className="text-xs text-gray-500 mt-2"></p>
            </div>
          </div>
        )}

        {/* ===== Step 3 ===== */}
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
