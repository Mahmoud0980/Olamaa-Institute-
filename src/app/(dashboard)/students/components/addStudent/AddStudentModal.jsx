"use client";

import { useState } from "react";
import { X } from "lucide-react";

// Steps
import Step1Student from "./steps/Step1Student";
import Step2StudentExtra from "./steps/Step2StudentExtra";
import Step3Parents from "./steps/Step3Parents";
import Step4Record from "./steps/Step4Record";
import Step5Contacts from "./steps/Step5Contacts";
import StepSuccess from "./steps/StepSuccess";
import Stepper from "@/components/common/Stepper";

// Modal
import FamilyCheckModal from "../FamilyCheckModal";

// APIs
import { useAddEnrollmentMutation } from "@/store/services/enrollmentsApi";
import { useAddRecordMutation } from "@/store/services/academicRecordsApi";
import { useAddContactMutation } from "@/store/services/contactsApi";

// Form
import { useForm } from "react-hook-form";

export default function AddStudentModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);

  const [studentId, setStudentId] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [fatherGuardianId, setFatherGuardianId] = useState(null);
  const [motherGuardianId, setMotherGuardianId] = useState(null);

  const [showFamilyCheck, setShowFamilyCheck] = useState(false);
  const [existingFamilyData, setExistingFamilyData] = useState(null);

  const form1 = useForm({ mode: "onTouched" });
  const form2 = useForm({ mode: "onTouched" });
  const form3 = useForm({ mode: "onTouched" });
  const form4 = useForm({ mode: "onTouched" });
  const form5 = useForm({ mode: "onTouched" });

  const [addEnrollment] = useAddEnrollmentMutation();
  const [addRecord] = useAddRecordMutation();
  const [addContact] = useAddContactMutation();

  // ---------------- Step 1 ----------------
  const handleStep1 = async () => {
    const ok = await form1.trigger();
    if (!ok) return;
    setStep(2);
  };

  // ---------------- Step 2 ----------------
  const handleStep2 = async () => {
    const ok = await form2.trigger();
    if (!ok) return;
    setStep(3);
  };

  // ---------------- Step 3 (Parents) ----------------
  const handleStep3 = async () => {
    const ok = await form3.trigger();
    if (!ok) return;

    const student = {
      ...form1.getValues(),
      ...form2.getValues(),
    };

    const p = form3.getValues();

    const fatherData = {
      first_name: p.father_first_name,
      last_name: p.father_last_name,
      national_id: p.father_national_id || null,
      phone: p.father_phone || null,
      occupation: p.father_occupation || null,
      address: p.father_address || null,
    };

    const motherData = {
      first_name: p.mother_first_name,
      last_name: p.mother_last_name,
      national_id: p.mother_national_id || null,
      phone: p.mother_phone || null,
      occupation: p.mother_occupation || null,
      address: p.mother_address || null,
    };

    // إرسال الطلب
    try {
      const res = await addEnrollment({
        student,
        father: fatherData,
        mother: motherData,
      }).unwrap();

      setStudentId(res.data.id);
      setFamilyId(res.data.family_id);
      setFatherGuardianId(res.data.father_guardian_id);
      setMotherGuardianId(res.data.mother_guardian_id);

      setStep(4);
    } catch (e) {
      console.log("Enrollment Error:", e);

      // --------------------------
      // فحص هل الخطأ بسبب وجود أهل
      // --------------------------
      const err = e?.data?.errors;

      if (
        err?.["father.national_id"]?.[0] ===
          "The father.national id has already been taken." ||
        err?.["mother.national_id"]?.[0] ===
          "The mother.national id has already been taken."
      ) {
        // عرض مودال ربط الأهل
        setExistingFamilyData({
          father: fatherData,
          mother: motherData,
        });
        setShowFamilyCheck(true);
        return;
      }

      alert(e?.data?.message || "خطأ غير متوقع");
    }
  };

  // عند قبول ربط الطالب بالأهل
  const confirmAttachFamily = async () => {
    setShowFamilyCheck(false);

    try {
      const res = await addEnrollment({
        student: {
          ...form1.getValues(),
          ...form2.getValues(),
        },
        family_id: existingFamilyData.family_id, // لازم تجي من API
      }).unwrap();

      setStudentId(res.data.id);
      setFamilyId(res.data.family_id);
      setFatherGuardianId(res.data.father_guardian_id);
      setMotherGuardianId(res.data.mother_guardian_id);

      setStep(4);
    } catch (e) {
      alert("فشل ربط الطالب بالعائلة");
    }
  };

  // ---------------- Step 4 ----------------
  const handleStep4 = async () => {
    const ok = await form4.trigger();
    if (!ok) return;

    try {
      await addRecord({
        student_id: studentId,
        ...form4.getValues(),
      }).unwrap();

      setStep(5);
    } catch (e) {
      alert("خطأ أثناء إضافة السجل الأكاديمي");
    }
  };

  // ---------------- Step 5 ----------------
  const handleStep5 = async () => {
    const ok = await form5.trigger();
    if (!ok) return;

    try {
      await addContact({
        guardian_id: fatherGuardianId || motherGuardianId,
        ...form5.getValues(),
      }).unwrap();

      setStep(6);
    } catch (e) {
      alert("خطأ أثناء إضافة بيانات الاتصال");
    }
  };

  const resetAll = () => {
    form1.reset();
    form2.reset();
    form3.reset();
    form4.reset();
    form5.reset();
    setStep(1);
  };

  return (
    <>
      {showFamilyCheck && (
        <FamilyCheckModal
          fatherData={existingFamilyData?.father}
          motherData={existingFamilyData?.mother}
          onConfirm={confirmAttachFamily}
          onCancel={() => setShowFamilyCheck(false)}
        />
      )}

      <div className="fixed inset-0 bg-black/40 flex justify-start z-50">
        <div className="w-[500px] bg-white h-full shadow-xl p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#6F013F] font-semibold">إضافة طالب جديد</h2>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Stepper */}
          <Stepper current={step} total={6} />

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
