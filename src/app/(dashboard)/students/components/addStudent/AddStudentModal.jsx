"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

import { useForm } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";

import Stepper from "@/components/common/Stepper";
import FamilyCheckModal from "../FamilyCheckModal";
import { notify } from "@/lib/helpers/toastify";
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
  const total = 8; //8
  const isEdit = !!student;
  const [loadingStep3, setLoadingStep3] = useState(false);
  const [loadingStep4, setLoadingStep4] = useState(false);
  const [loadingStep5, setLoadingStep5] = useState(false);

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

  /* ✅ connection state (اختياري يفيدك للـ UI) */
  const [isOnline, setIsOnline] = useState(true);

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
  const [lockBackFromStep4, setLockBackFromStep4] = useState(false);

  /* ================= Forms ================= */
  const form1 = useForm({ mode: "onTouched" });
  const form2 = useForm({ mode: "onTouched" });
  const form3 = useForm({ mode: "onTouched" });
  const form4 = useForm({ mode: "onTouched" });

  const pickFirstError = (errorsObj) => {
    const any = Object.values(errorsObj || {}).find((e) => e?.message);
    return any?.message || "تحقق من البيانات";
  };

  /* ================= ✅ Internet check ================= */
  const ensureOnline = useCallback(async () => {
    // 1) فحص سريع من المتصفح
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return false;
    }

    // 2) فحص فعلي خفيف (اختياري لكنه أدق)
    // ملاحظة: لو عندك Endpoint health check بسيرفرك استبدله هون.
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3500);

      // نضرب طلب صغير (HEAD) على نفس الدومين
      // إذا السيرفر Down رح يفشل، وهيك بتعتبره "ما في اتصال مفيد للتسجيل"
      await fetch("/favicon.ico", {
        method: "HEAD",
        cache: "no-store",
        signal: ctrl.signal,
      });

      clearTimeout(t);
      return true;
    } catch {
      return false;
    }
  }, []);

  // تحديث isOnline تلقائيًا (للـ UI/تعطيل زر مثلًا)
  useEffect(() => {
    const update = () =>
      setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

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
    setLockBackFromStep4(false);

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
    if (!isEdit) return; // مهم: بس بالتعديل
    const record = recordsRes?.data?.[0];
    if (!record) return;

    form4.reset({
      record_type: record.record_type,
      total_score: record.total_score,
      year: record.year,
      description: record.description,
    });

    setAcademicRecordId(record.id);
  }, [recordsRes, isEdit]);

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
    const ok = await form1.trigger([
      "first_name",
      "last_name",
      "birth_place",
      "date_of_birth",
      "national_id",
      "branch_id",
      "institute_branch_id",
    ]);

    if (!ok) {
      notify.error(pickFirstError(form1.formState.errors), "تحقق من البيانات");
      return;
    }

    setStep(2);
  };

  const handleStep2 = async () => {
    const ok = await form2.trigger([
      "enrollment_date",
      "start_attendance_date",
      "gender",
      "previous_school_name",
      "how_know_institute",
      "city_id",
      "status_id",
      "bus_id",
      "health_status",
      "psychological_status",
      "notes",
      "profile_photo",
      "id_card_photo",
    ]);

    if (!ok) {
      notify.error(pickFirstError(form2.formState.errors), "تحقق من البيانات");
      return;
    }

    setStep(3);
  };

  const handleStep3 = async () => {
    const ok = await form3.trigger();
    if (!ok) {
      notify.error(pickFirstError(form3.formState.errors), "تحقق من البيانات");
      return;
    }

    // بالتعديل ما في API هون (حسب كودك)
    if (isEdit) {
      setStep(4);
      return;
    }

    // ✅ قبل الـ API: افحص الإنترنت
    const online = await ensureOnline();
    if (!online) {
      notify.error(
        "لا يوجد  اتصال إنترنت. رجاءً تأكد من الشبكة وحاول مرة ثانية.",
        "لا يوجد إنترنت"
      );
      return;
    }

    setLoadingStep3(true);
    try {
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
        return; // رح ينطفي اللودر بالـ finally
      }

      setStudentId(res.data.id);
      setFamilyId(res.data.family_id);
      setGuardians(res.data.guardians || []);
      setLockBackFromStep4(true);
      setStep(4);
    } catch (e) {
      // ✅ إذا قطع الإنترنت أثناء الطلب أو فشل الشبكة
      const onlineNow = await ensureOnline();
      if (!onlineNow) {
        notify.error(
          "انقطع الاتصال أثناء الحفظ. تأكد من الإنترنت وحاول مرة ثانية.",
          "مشكلة اتصال"
        );
      } else {
        notify.error("فشل تسجيل الطالب", "خطأ");
      }
    } finally {
      setLoadingStep3(false);
    }
  };

  const confirmAttachFamily = async () => {
    setShowFamilyCheck(false);

    // ✅ قبل الـ API: افحص الإنترنت
    const online = await ensureOnline();
    if (!online) {
      notify.error(
        "لا يوجد  اتصال إنترنت. رجاءً تأكد من الشبكة وحاول مرة ثانية.",
        "لا يوجد إنترنت"
      );
      return;
    }

    setLoadingStep3(true);
    try {
      const res = await handleAddEnrollment({
        ...pendingEnrollment,
        __sendFamilyDecision: true,
        is_existing_family_confirmed: true,
      });

      setStudentId(res.data.id);
      setFamilyId(res.data.family_id);
      setGuardians(res.data.guardians || []);
      setLockBackFromStep4(true);
      setStep(4);
    } catch (e) {
      const onlineNow = await ensureOnline();
      if (!onlineNow) {
        notify.error(
          "انقطع الاتصال أثناء الربط. تأكد من الإنترنت وحاول مرة ثانية.",
          "مشكلة اتصال"
        );
      } else {
        notify.error("فشل ربط العائلة", "خطأ");
      }
    } finally {
      setLoadingStep3(false);
    }
  };

  const confirmNewFamily = async () => {
    setShowFamilyCheck(false);

    // ✅ قبل الـ API: افحص الإنترنت
    const online = await ensureOnline();
    if (!online) {
      notify.error(
        "لا يوجد اتصال إنترنت. رجاءً تأكد من الشبكة وحاول مرة ثانية.",
        "لا يوجد إنترنت"
      );
      return;
    }

    setLoadingStep3(true);
    try {
      const res = await handleAddEnrollment({
        ...pendingEnrollment,
        __sendFamilyDecision: true,
        is_existing_family_confirmed: false,
      });

      setStudentId(res.data.id);
      setFamilyId(res.data.family_id);
      setGuardians(res.data.guardians || []);
      setLockBackFromStep4(true);
      setStep(4);
    } catch (e) {
      const onlineNow = await ensureOnline();
      if (!onlineNow) {
        notify.error(
          "انقطع الاتصال أثناء الإنشاء. تأكد من الإنترنت وحاول مرة ثانية.",
          "مشكلة اتصال"
        );
      } else {
        notify.error("فشل إنشاء عائلة جديدة", "خطأ");
      }
    } finally {
      setLoadingStep3(false);
    }
  };

  const handleStep4 = async () => {
    const ok = await form4.trigger([
      "record_type",
      "total_score",
      "year",
      "description",
    ]);
    if (!ok) {
      notify.error(pickFirstError(form4.formState.errors), "تحقق من البيانات");
      return;
    }

    setLoadingStep4(true);
    try {
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
    } catch (e) {
      notify.error("فشل حفظ السجل الأكاديمي", "خطأ");
    } finally {
      setLoadingStep4(false);
    }
  };

  const handleSaveContacts = async (contactsPayload) => {
    setLoadingStep5(true);
    try {
      await Promise.all(
        existingContacts.map((c) => deleteContact(c.id).unwrap())
      );
      await Promise.all(contactsPayload.map((it) => addContact(it).unwrap()));
      setStep(6);
    } catch (e) {
      notify.error("فشل حفظ جهات التواصل", "خطأ");
    } finally {
      setLoadingStep5(false);
    }
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
            <div className="flex flex-col gap-1">
              <h2 className="text-[#6F013F] font-semibold">
                {isEdit ? "تعديل طالب" : "إضافة طالب"}
              </h2>

              {/* اختياري: مؤشر اتصال صغير */}
              <span className="text-xs text-gray-500">
                {isOnline ? "متصل" : "غير متصل"}
              </span>
            </div>

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
                onBack={handleClose}
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
                loading={loadingStep3}
              />
            )}

            {step === 4 && (
              <Step4Record
                control={form4.control}
                register={form4.register}
                errors={form4.formState.errors}
                onNext={handleStep4}
                onBack={() => {
                  if (lockBackFromStep4) return; // ممنوع الرجوع للخطوة 3 بعد الحفظ
                  setStep(3);
                }}
                loading={loadingStep4}
              />
            )}

            {step === 5 && (
              <Step5Contacts
                guardians={guardians}
                existingContacts={existingContacts}
                onSaveAll={handleSaveContacts}
                onBack={() => setStep(4)}
                loading={loadingStep5}
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

            {step === 7 && (
              <Step7Payment
                studentId={studentId}
                instituteBranchId={form1.getValues("institute_branch_id")}
                enrollmentContractId={enrollmentContractId}
                onBack={() => setStep(6)}
                onFinish={() => setStep(8)}
              />
            )}

            {step === 8 && (
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
