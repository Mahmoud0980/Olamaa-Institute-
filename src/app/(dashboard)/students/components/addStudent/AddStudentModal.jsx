"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";

import Stepper from "@/components/common/Stepper";
import FamilyCheckModal from "../FamilyCheckModal";

import Step1Student from "./steps/Step1Student";
import Step2StudentExtra from "./steps/Step2StudentExtra";
import Step3Parents from "./steps/Step3Parents";
import Step4Record from "./steps/Step4Record";
import Step5Contacts from "./steps/Step5Contacts";
import Step6EnrollmentContract from "./steps/Step6EnrollmentContract";
import Step7Payment from "./steps/Step7Payment";
import StepSuccess from "./steps/StepSuccess";

import useAddEnrollment from "../../hooks/useAddEnrollment";

import {
  useGetRecordsQuery,
  useAddRecordMutation,
  useUpdateRecordMutation,
} from "@/store/services/academicRecordsApi";

import {
  useGetContactsQuery,
  useAddContactMutation,
  useDeleteContactMutation,
} from "@/store/services/contactsApi";

/* ================= helpers ================= */
const clean = (v) => {
  const s = String(v ?? "")
    .trim()
    .replace(/\s+/g, " ");
  return s === "" ? null : s;
};

export default function AddStudentModal({ isOpen, onClose, student, onAdded }) {
  /* ================= meta ================= */
  const total = 7; //8
  const isEdit = !!student;

  /* ================= state ================= */
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState(student?.id ?? null);
  const [familyId, setFamilyId] = useState(student?.family_id ?? null);
  const [guardians, setGuardians] = useState([]);
  const [academicRecordId, setAcademicRecordId] = useState(null);
  const [existingContacts, setExistingContacts] = useState([]);
  const [enrollmentContractId, setEnrollmentContractId] = useState(null);

  const [showFamilyCheck, setShowFamilyCheck] = useState(false);
  const [familyCandidate, setFamilyCandidate] = useState(null);
  const [pendingEnrollment, setPendingEnrollment] = useState(null);

  /* ================= APIs ================= */
  const { handleAddEnrollment } = useAddEnrollment();

  const { data: recordsRes } = useGetRecordsQuery(
    studentId ? { student_id: studentId } : skipToken
  );

  const { data: contactsRes } = useGetContactsQuery(
    studentId ? { student_id: studentId } : skipToken
  );

  const [addRecord] = useAddRecordMutation();
  const [updateRecord] = useUpdateRecordMutation();
  const [addContact] = useAddContactMutation();
  const [deleteContact] = useDeleteContactMutation();

  /* ================= Forms ================= */
  const form1 = useForm({ mode: "onTouched" });
  const form2 = useForm({ mode: "onTouched" });
  const form3 = useForm({ mode: "onTouched" });
  const form4 = useForm({ mode: "onTouched" });

  /* ================= Reset ================= */
  const resetAll = () => {
    setStep(1);
    setStudentId(null);
    setFamilyId(null);
    setGuardians([]);
    setAcademicRecordId(null);
    setExistingContacts([]);
    setEnrollmentContractId(null);
    setShowFamilyCheck(false);
    setFamilyCandidate(null);
    setPendingEnrollment(null);

    form1.reset();
    form2.reset();
    form3.reset();
    form4.reset();
  };

  useEffect(() => {
    if (!isOpen) resetAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ================= Edit Fill ================= */
  useEffect(() => {
    if (!student) return;

    form1.reset({
      first_name: student.first_name,
      last_name: student.last_name,
      birth_place: student.birth_place,
      date_of_birth: student.date_of_birth,
      national_id: student.national_id,
      gender: student.gender,
      branch_id: student.branch_id,
      institute_branch_id: student.institute_branch_id,
    });

    form2.reset({
      enrollment_date: student.enrollment_date,
      start_attendance_date: student.start_attendance_date,
      previous_school_name: student.previous_school_name,
      how_know_institute: student.how_know_institute,
      city_id: student.city_id,
      status_id: student.status_id,
      bus_id: student.bus_id,
      health_status: student.health_status,
      psychological_status: student.psychological_status,
      notes: student.notes,
    });

    setStudentId(student.id);
    setFamilyId(student.family_id);
    setStep(1);
  }, [student]);

  /* ================= Academic Record ================= */
  useEffect(() => {
    const record = recordsRes?.data?.[0];
    if (!record) return;

    form4.reset({
      record_type: record.record_type,
      total_score: record.total_score,
      year: record.year,
      description: record.description,
    });

    setAcademicRecordId(record.id);
  }, [recordsRes]);

  /* ================= Contacts ================= */
  useEffect(() => {
    if (contactsRes?.data) {
      setExistingContacts(contactsRes.data);
    }
  }, [contactsRes]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetAll();
    onClose();
  };

  /* ================= Steps Logic ================= */

  const handleStep1 = async () => {
    if (await form1.trigger()) setStep(2);
  };

  const handleStep2 = async () => {
    if (await form2.trigger()) setStep(3);
  };

  const handleStep3 = async () => {
    if (!(await form3.trigger())) return;

    if (isEdit) {
      setStep(4);
      return;
    }

    const studentData = { ...form1.getValues(), ...form2.getValues() };
    const p = form3.getValues();

    const payload = {
      student: {
        ...studentData,
        first_name: clean(studentData.first_name),
        last_name: clean(studentData.last_name),
      },
      father: {
        first_name: clean(p.father_first_name),
        last_name: clean(p.father_last_name),
        national_id: clean(p.father_national_id),
        phone: clean(p.father_phone),
      },
      mother: {
        first_name: clean(p.mother_first_name),
        last_name: clean(p.mother_last_name),
        national_id: clean(p.mother_national_id),
        phone: clean(p.mother_phone),
      },
    };

    setPendingEnrollment(payload);

    const res = await handleAddEnrollment(payload);

    if (res?.message?.includes("تم العثور على عائلة موجودة")) {
      setFamilyCandidate(res?.data?.family || null);
      setShowFamilyCheck(true);
      return;
    }

    setStudentId(res.data.id);
    setFamilyId(res.data.family_id);
    setGuardians(res.data.guardians || []);
    setStep(4);
  };

  const confirmAttachFamily = async () => {
    setShowFamilyCheck(false);
    const res = await handleAddEnrollment({
      ...pendingEnrollment,
      __sendFamilyDecision: true,
      is_existing_family_confirmed: true,
    });

    setStudentId(res.data.id);
    setFamilyId(res.data.family_id);
    setGuardians(res.data.guardians || []);
    setStep(4);
  };

  const confirmNewFamily = async () => {
    setShowFamilyCheck(false);
    const res = await handleAddEnrollment({
      ...pendingEnrollment,
      __sendFamilyDecision: true,
      is_existing_family_confirmed: false,
    });

    setStudentId(res.data.id);
    setFamilyId(res.data.family_id);
    setGuardians(res.data.guardians || []);
    setStep(4);
  };

  const handleStep4 = async () => {
    if (!(await form4.trigger())) return;

    const payload = {
      student_id: studentId,
      ...form4.getValues(),
    };

    if (academicRecordId) {
      await updateRecord({ id: academicRecordId, ...payload }).unwrap();
    } else {
      await addRecord(payload).unwrap();
    }

    setStep(5);
  };

  const handleSaveContacts = async (contactsPayload) => {
    for (const c of existingContacts) {
      await deleteContact(c.id).unwrap();
    }
    for (const item of contactsPayload) {
      await addContact(item).unwrap();
    }
    setStep(6);
  };

  /* ================= render ================= */
  return (
    <>
      {showFamilyCheck && (
        <FamilyCheckModal
          family={familyCandidate}
          onConfirmAttach={confirmAttachFamily}
          onConfirmNew={confirmNewFamily}
          onClose={() => setShowFamilyCheck(false)}
        />
      )}

      <div className="fixed inset-0 bg-black/40 z-50 flex">
        <div className="w-[520px] bg-white h-full p-6 overflow-y-auto">
          <div className="flex justify-between mb-4">
            <h2 className="text-[#6F013F] font-semibold">
              {isEdit ? "تعديل طالب" : "إضافة طالب"}
            </h2>
            <button onClick={handleClose}>
              <X />
            </button>
          </div>

          <Stepper current={step} total={total} />

          <div className="mt-6">
            {step === 1 && (
              <Step1Student
                control={form1.control}
                register={form1.register}
                errors={form1.formState.errors}
                onNext={handleStep1}
              />
            )}

            {step === 2 && (
              <Step2StudentExtra
                control={form2.control}
                register={form2.register}
                errors={form2.formState.errors}
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
                watch={form3.watch}
                onNext={handleStep3}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <Step4Record
                control={form4.control}
                register={form4.register}
                errors={form4.formState.errors}
                onNext={handleStep4}
                onBack={() => setStep(3)}
              />
            )}

            {step === 5 && (
              <Step5Contacts
                guardians={guardians}
                existingContacts={existingContacts}
                onSaveAll={handleSaveContacts}
                onBack={() => setStep(4)}
              />
            )}

            {step === 6 && (
              <Step6EnrollmentContract
                studentId={studentId}
                onBack={() => setStep(5)}
                onNext={(id) => {
                  setEnrollmentContractId(id);
                  setStep(7); //7
                }}
              />
            )}

            {/* {step === 7 && (
              <Step7Payment
                studentId={studentId}
                instituteBranchId={form1.getValues("institute_branch_id")}
                enrollmentContractId={enrollmentContractId}
                onBack={() => setStep(6)}
                onFinish={() => setStep(8)}
              />
            )} */}

            {step === 7 && (
              <StepSuccess
                studentId={studentId}
                onReset={() => {
                  resetAll();
                  onAdded?.();
                }}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
