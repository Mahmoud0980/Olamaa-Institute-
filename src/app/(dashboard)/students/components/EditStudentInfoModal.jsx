"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";
import { useForm, Controller } from "react-hook-form";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import DatePickerSmart from "@/components/common/DatePickerSmart";

import { useUpdateStudentMutation } from "@/store/services/studentsApi";
import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetCitiesQuery } from "@/store/services/citiesApi";
import { useGetStudentStatusesQuery } from "@/store/services/studentStatusesApi";
import { useGetBusesQuery } from "@/store/services/busesApi";
import { useGetKnowWaysQuery } from "@/store/services/knowWaysApi";

export default function EditStudentInfoModal({ isOpen, onClose, student }) {
  const [step, setStep] = useState(1);
  const [showSpinner, setShowSpinner] = useState(false);
  const [updateStudent, { isLoading }] = useUpdateStudentMutation();

  const form = useForm({ mode: "onTouched" });
  const {
    register,
    control,
    reset,
    getValues,
    formState: { errors },
  } = form;

  const { data: branchesRes } = useGetAcademicBranchesQuery();
  const { data: institutesRes } = useGetInstituteBranchesQuery();
  const { data: citiesRes } = useGetCitiesQuery();
  const { data: statusesRes } = useGetStudentStatusesQuery();
  const { data: busesRes } = useGetBusesQuery();
  const { data: knowWaysRes } = useGetKnowWaysQuery();

  const branches = branchesRes?.data || [];
  const institutes = institutesRes?.data || [];
  const cities = citiesRes?.data || [];
  const statuses = statusesRes?.data || [];
  const buses = busesRes?.data || [];
  const knowWays = knowWaysRes?.data || [];

  const emptyValues = useMemo(
    () => ({
      first_name: "",
      last_name: "",
      birth_place: "",
      date_of_birth: "",
      national_id: "",
      branch_id: "",
      institute_branch_id: "",

      enrollment_date: "",
      start_attendance_date: "",
      previous_school_name: "",
      how_know_institute: "",
      city_id: "",
      status_id: "",
      bus_id: "",
      gender: "",
      health_status: "",
      psychological_status: "",
      notes: "",
    }),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setShowSpinner(true);
    reset(emptyValues);

    if (student) {
      reset({
        first_name: student.first_name ?? "",
        last_name: student.last_name ?? "",
        birth_place: student.birth_place ?? "",
        date_of_birth: student.date_of_birth ?? "",
        national_id: student.national_id ?? "",
        branch_id: student.branch_id ? String(student.branch_id) : "",
        institute_branch_id: student.institute_branch_id
          ? String(student.institute_branch_id)
          : "",

        enrollment_date: student.enrollment_date ?? "",
        start_attendance_date: student.start_attendance_date ?? "",
        previous_school_name: student.previous_school_name ?? "",
        how_know_institute: student.how_know_institute ?? "",
        city_id: student.city_id ? String(student.city_id) : "",
        status_id: student.status_id ? String(student.status_id) : "",
        bus_id: student.bus_id ? String(student.bus_id) : "",
        gender: student.gender ?? "",
        health_status: student.health_status ?? "",
        psychological_status: student.psychological_status ?? "",
        notes: student.notes ?? "",
      });

      const t = setTimeout(() => setShowSpinner(false), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen, student, reset, emptyValues]);

  useEffect(() => {
    if (!isOpen) return;

    if (!student) {
      setShowSpinner(true);
      reset(emptyValues);
      return;
    }

    setShowSpinner(true);

    reset({
      first_name: student.first_name ?? "",
      last_name: student.last_name ?? "",
      birth_place: student.birth_place ?? "",
      date_of_birth: student.date_of_birth ?? "",
      national_id: student.national_id ?? "",
      branch_id: student.branch_id ? String(student.branch_id) : "",
      institute_branch_id: student.institute_branch_id
        ? String(student.institute_branch_id)
        : "",

      enrollment_date: student.enrollment_date ?? "",
      start_attendance_date: student.start_attendance_date ?? "",
      previous_school_name: student.previous_school_name ?? "",
      how_know_institute: student.how_know_institute ?? "",
      city_id: student.city_id ? String(student.city_id) : "",
      status_id: student.status_id ? String(student.status_id) : "",
      bus_id: student.bus_id ? String(student.bus_id) : "",
      gender: student.gender ?? "",
      health_status: student.health_status ?? "",
      psychological_status: student.psychological_status ?? "",
      notes: student.notes ?? "",
    });

    const t = setTimeout(() => setShowSpinner(false), 150);
    return () => clearTimeout(t);
  }, [student?.id, isOpen, reset, emptyValues, student]);

  if (!isOpen) return null;

  const handleNext = async () => {
    setStep((s) => Math.min(2, s + 1));
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSave = async () => {
    try {
      if (!student?.id) {
        notify.error("لا يوجد طالب محدد");
        return;
      }

      const v = getValues();

      const payload = {
        id: student.id,

        first_name: v.first_name || null,
        last_name: v.last_name || null,
        birth_place: v.birth_place || null,
        date_of_birth: v.date_of_birth || null,
        national_id: v.national_id || null,
        branch_id: v.branch_id ? Number(v.branch_id) : null,
        institute_branch_id: v.institute_branch_id
          ? Number(v.institute_branch_id)
          : null,

        enrollment_date: v.enrollment_date || null,
        start_attendance_date: v.start_attendance_date || null,
        previous_school_name: v.previous_school_name || null,
        how_know_institute: v.how_know_institute || null,
        city_id: v.city_id ? Number(v.city_id) : null,
        status_id: v.status_id ? Number(v.status_id) : null,
        bus_id: v.bus_id ? Number(v.bus_id) : null,
        gender: v.gender || null,
        health_status: v.health_status || null,
        psychological_status: v.psychological_status || null,
        notes: v.notes || null,
      };

      await updateStudent(payload).unwrap();
      notify.success("تم تعديل بيانات الطالب");
      onClose?.();
    } catch (e) {
      notify.error(e?.data?.message || "فشل تعديل بيانات الطالب");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-start">
      <div className="w-[520px] bg-white h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            تعديل بيانات الطالب
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            type="button"
          >
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {showSpinner ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Spinner />
              <div className="text-sm text-gray-500">
                جاري تحميل بيانات الطالب...
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {step === 1 && (
                <>
                  <InputField
                    label="اسم الطالب"
                    register={register("first_name")}
                  />

                  <InputField
                    label="كنية الطالب"
                    register={register("last_name")}
                  />

                  <InputField
                    label="مكان الولادة"
                    register={register("birth_place")}
                  />

                  <Controller
                    control={control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <DatePickerSmart
                        label="تاريخ الولادة"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="dd/mm/yyyy"
                      />
                    )}
                  />

                  <InputField
                    label="الرقم الوطني (اختياري)"
                    type="text"
                    placeholder="10 أرقام فقط"
                    register={register("national_id", {
                      setValueAs: (v) =>
                        String(v ?? "")
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      validate: (v) => {
                        const digits = String(v ?? "").replace(/\D/g, "");
                        if (digits.length === 0) return true;
                        return digits.length === 10 || "يجب إدخال 10 أرقام فقط";
                      },
                      onChange: (e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                      },
                    })}
                    error={form.formState.errors?.national_id?.message}
                  />

                  <Controller
                    control={control}
                    name="branch_id"
                    render={({ field }) => (
                      <SearchableSelect
                        label="الفرع الدراسي"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={branches.map((b) => ({
                          key: b.id,
                          value: String(b.id),
                          label: b.name,
                        }))}
                        placeholder="اختر الفرع"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="institute_branch_id"
                    render={({ field }) => (
                      <SearchableSelect
                        label="فرع المعهد"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={institutes.map((i) => ({
                          key: i.id,
                          value: String(i.id),
                          label: i.name,
                        }))}
                        placeholder="اختر فرع المعهد"
                      />
                    )}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Controller
                    control={control}
                    name="enrollment_date"
                    render={({ field }) => (
                      <DatePickerSmart
                        label="تاريخ التسجيل"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="dd/mm/yyyy"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="start_attendance_date"
                    render={({ field }) => (
                      <DatePickerSmart
                        label="تاريخ بدء الحضور"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="dd/mm/yyyy"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <SearchableSelect
                        label="الجنس"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={[
                          { key: "male", value: "male", label: "ذكر" },
                          { key: "female", value: "female", label: "أنثى" },
                        ]}
                        placeholder="اختر الجنس"
                      />
                    )}
                  />

                  <InputField
                    label="اسم المدرسة السابقة"
                    register={register("previous_school_name")}
                  />

                  <Controller
                    control={control}
                    name="how_know_institute"
                    render={({ field }) => (
                      <SearchableSelect
                        label="كيف عرفت بالمعهد؟"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={knowWays.map((k, idx) => ({
                          key: `${k.id ?? idx}`,
                          value: k.name,
                          label: k.name,
                        }))}
                        placeholder="اختر الطريقة"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="city_id"
                    render={({ field }) => (
                      <SearchableSelect
                        label="المدينة"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={cities.map((c) => ({
                          key: c.id,
                          value: String(c.id),
                          label: c.name,
                        }))}
                        placeholder="اختر المدينة"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="status_id"
                    render={({ field }) => (
                      <SearchableSelect
                        label="حالة الطالب"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={statuses.map((s) => ({
                          key: s.id,
                          value: String(s.id),
                          label: s.name,
                        }))}
                        placeholder="اختر الحالة"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="bus_id"
                    render={({ field }) => (
                      <SearchableSelect
                        label="الحافلة"
                        value={field.value || ""}
                        onChange={field.onChange}
                        options={buses.map((b) => ({
                          key: b.id,
                          value: String(b.id),
                          label: b.name || b.code || `Bus #${b.id}`,
                        }))}
                        placeholder="اختر الحافلة"
                        allowClear
                      />
                    )}
                  />

                  <InputField
                    label="الحالة الصحية"
                    register={register("health_status")}
                  />
                  <InputField
                    label="الحالة النفسية"
                    register={register("psychological_status")}
                  />
                  <InputField label="ملاحظات" register={register("notes")} />
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <StepButtonsSmart
            step={step}
            total={2}
            onBack={step === 1 ? onClose : handleBack}
            onNext={step === 2 ? handleSave : handleNext}
            loading={isLoading}
            disabled={showSpinner}
          />
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#6F013F] animate-spin" />
  );
}
