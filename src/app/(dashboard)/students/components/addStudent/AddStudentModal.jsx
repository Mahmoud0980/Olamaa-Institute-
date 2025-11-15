"use client";

import { useState } from "react";
import { X } from "lucide-react";

// خطوات
import Step1Student from "./steps/Step1Student";
import Step2StudentExtra from "./steps/Step2StudentExtra";
import Step3Parents from "./steps/Step3Parents";
import Step4Record from "./steps/Step4Record";
import Step5Contacts from "./steps/Step5Contacts";
import StepSuccess from "./steps/StepSuccess";
import Stepper from "../../../../../components/common/Stepper";

// مودال ربط العائلة
import FamilyCheckModal from "../FamilyCheckModal";

// APIs
import { useAddEnrollmentMutation } from "@/store/services/enrollmentsApi";
import { useAddRecordMutation } from "@/store/services/academicRecordsApi";
import { useAddContactMutation } from "@/store/services/contactsApi";

// React Hook Form
import { useForm } from "react-hook-form";

export default function AddStudentModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // الخطوة الحالية
  const [step, setStep] = useState(1);

  // تخزين IDs
  const [studentId, setStudentId] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [fatherGuardianId, setFatherGuardianId] = useState(null);
  const [motherGuardianId, setMotherGuardianId] = useState(null);

  // مودال فحص الأهل
  const [showFamilyCheck, setShowFamilyCheck] = useState(false);
  const [existingFamily, setExistingFamily] = useState(null);

  // فورم الخطوات
  const form1 = useForm({ mode: "onTouched" }); // step1
  const form2 = useForm({ mode: "onTouched" }); // step2
  const form3 = useForm({ mode: "onTouched" }); // parents
  const form4 = useForm({ mode: "onTouched" }); // record
  const form5 = useForm({ mode: "onTouched" }); // contacts

  // Mutations
  const [addEnrollment] = useAddEnrollmentMutation();
  const [addRecord] = useAddRecordMutation();
  const [addContact] = useAddContactMutation();

  // ============================
  // خطوة 1 → التالي
  // ============================
  const handleStep1 = async () => {
    const valid = await form1.trigger();
    if (!valid) return;

    setStep(2);
  };

  // ============================
  // خطوة 2 → فحص أهل موجودين
  // ============================
  const handleStep2 = async () => {
    const valid = await form2.trigger();
    if (!valid) return;
    setStep(3);
  };

  // ============================
  // خطوة 3 → إرسال الطالب + الأهل أو ربط العائلة
  // ============================
  const handleStep3 = async () => {
    // تحقق من صحة إدخال بيانات الأهل (الخطوة 3)
    const valid = await form3.trigger();
    if (!valid) return;

    const p = form3.getValues();

    // -------------------------------------------
    // 1) فحص وجود أهل بناءً على الرقم الوطني
    // -------------------------------------------
    const fatherId = p.father_national_id;
    const motherId = p.mother_national_id;

    if (!existingFamily && (fatherId || motherId)) {
      try {
        const res = await fetch(
          `/api/families/check?father_id=${fatherId ?? ""}&mother_id=${
            motherId ?? ""
          }`
        );
        const data = await res.json();

        if (data.exists) {
          setExistingFamily(data.family);
          setShowFamilyCheck(true);
          return; // أوقف التنفيذ هنا
        }
      } catch (err) {
        console.error("Family check failed:", err);
      }
    }

    // -------------------------------------------
    // 2) إذا وجد أهل وتمت الموافقة → أرسل الطالب فقط
    // -------------------------------------------
    if (existingFamily) {
      const payload = {
        student: {
          ...form1.getValues(),
          ...form2.getValues(),
        },
        family_id: existingFamily.id,
      };

      try {
        const res = await addEnrollment(payload).unwrap();

        setStudentId(res.data.id);
        setFamilyId(existingFamily.id);
        setFatherGuardianId(res.data.father_guardian_id);
        setMotherGuardianId(res.data.mother_guardian_id);

        setStep(4); // انتقل مباشرة للخطوة الرابعة
      } catch (err) {
        console.error(err);
        alert("خطأ أثناء ربط الطالب مع العائلة");
      }

      return;
    }

    // -------------------------------------------
    // 3) أهل جدد → أرسل الاب + الأم مع الطالب
    // -------------------------------------------
    const payload = {
      student: {
        ...form1.getValues(),
        ...form2.getValues(),
      },

      father: {
        first_name: p.father_first_name,
        last_name: p.father_last_name,
        national_id: p.father_national_id || null,
        phone: p.father_phone || null,
        occupation: p.father_occupation || null,
        address: p.father_address || null,
      },

      mother: {
        first_name: p.mother_first_name,
        last_name: p.mother_last_name,
        national_id: p.mother_national_id || null,
        phone: p.mother_phone || null,
        occupation: p.mother_occupation || null,
        address: p.mother_address || null,
      },
    };

    try {
      const res = await addEnrollment(payload).unwrap();

      setStudentId(res.data.id);
      setFamilyId(res.data.family_id);
      setFatherGuardianId(res.data.father_guardian_id);
      setMotherGuardianId(res.data.mother_guardian_id);

      setStep(4);
    } catch (err) {
      console.error(err);
      alert("خطأ أثناء إضافة الطالب والأهل");
    }
  };

  // ============================
  // خطوة 4 → السجل الأكاديمي
  // ============================
  const handleStep4 = async () => {
    const valid = await form4.trigger();
    if (!valid) return;

    try {
      await addRecord({
        student_id: studentId,
        ...form4.getValues(),
      }).unwrap();

      setStep(5);
    } catch (err) {
      alert("خطأ أثناء إضافة السجل الأكاديمي");
    }
  };

  // ============================
  // خطوة 5 → جهات الاتصال
  // ============================
  const handleStep5 = async () => {
    const valid = await form5.trigger();
    if (!valid) return;

    try {
      await addContact({
        guardian_id: fatherGuardianId || motherGuardianId,
        ...form5.getValues(),
      }).unwrap();

      setStep(6);
    } catch (err) {
      alert("خطأ أثناء إضافة بيانات الاتصال");
    }
  };

  // ============================
  // Reset كامل
  // ============================
  const resetAll = () => {
    form1.reset();
    form2.reset();
    form3.reset();
    form4.reset();
    form5.reset();

    setStep(1);
    setExistingFamily(null);
  };

  return (
    <>
      {/* مودال فحص العائلة */}
      {showFamilyCheck && (
        <FamilyCheckModal
          family={existingFamily}
          onCancel={() => {
            setShowFamilyCheck(false);
            setExistingFamily(null);
          }}
          onConfirm={() => {
            setShowFamilyCheck(false);
            setStep(3); // سيقوم handleStep3 بإرسال الطالب بدون أهل
          }}
        />
      )}

      <div className="fixed inset-0 bg-black/40 flex justify-start z-50 backdrop-blur-md">
        <div className="w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#6F013F] font-semibold">إضافة طالب جديد</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          {/* Stepper */}
          <Stepper current={step} total={6} />

          {/* Body */}
          <div className="mt-6">
            {step === 1 && (
              <Step1Student
                register={form1.register}
                errors={form1.formState.errors}
                setValue={form1.setValue}
                watch={form1.watch}
                onNext={handleStep1}
              />
            )}

            {step === 2 && (
              <Step2StudentExtra
                register={form2.register}
                errors={form2.formState.errors}
                setValue={form2.setValue}
                watch={form2.watch}
                onNext={handleStep2}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3Parents
                register={form3.register}
                errors={form3.formState.errors}
                setValue={form3.setValue}
                onNext={handleStep3}
                onBack={() => setStep(2)}
                existingFamily={existingFamily}
              />
            )}

            {step === 4 && (
              <Step4Record
                register={form4.register}
                errors={form4.formState.errors}
                onNext={handleStep4}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && (
              <Step5Contacts
                register={form5.register}
                errors={form5.formState.errors}
                setValue={form5.setValue}
                onNext={handleStep5}
                onBack={() => setStep(4)}
              />
            )}

            {step === 6 && <StepSuccess onReset={resetAll} onClose={onClose} />}
          </div>
        </div>
      </div>
    </>
  );
}
