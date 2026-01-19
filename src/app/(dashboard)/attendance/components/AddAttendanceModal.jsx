// "use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

// APIs
import { useGetStudentsDetailsQuery } from "@/store/services/studentsApi";
import {
  useAddManualAttendanceMutation,
  useUpdateAttendanceMutation,
} from "@/store/services/attendanceApi";

function studentFullName(s) {
  if (!s) return "";
  if (s.full_name) return s.full_name;
  const first = s.first_name || s.name || "";
  const last = s.last_name || s.family_name || s.surname || "";
  return `${first} ${last}`.trim();
}

export default function AddAttendanceModal({ isOpen, onClose, record }) {
  const [addManualAttendance] = useAddManualAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const { data: studentsRes } = useGetStudentsDetailsQuery();
  const allStudents = studentsRes?.data || [];

  const [loading, setLoading] = useState(false);
  const step = 1;
  const total = 1;

  const initialForm = {
    student_id: "",
    status: "",
  };

  const [form, setForm] = useState(initialForm);

  const studentOptions = useMemo(() => {
    return (allStudents || [])
      .map((s) => {
        const label = studentFullName(s);
        if (!label) return null;
        return { value: String(s.id), label };
      })
      .filter(Boolean);
  }, [allStudents]);

  // ✅ فقط: حاضر / متأخر / غائب
  const statusOptions = [
    { value: "present", label: "حاضر" },
    { value: "late", label: "متأخر" },
    { value: "absent", label: "غائب" },
  ];

  // fill edit
  useEffect(() => {
    if (!isOpen) return;

    if (record) {
      setForm({
        student_id: record?.student_id ? String(record.student_id) : "",
        status: record?.status || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, record]);

  const handleSubmit = async () => {
    if (!form.student_id) return toast.error("يرجى اختيار الطالب");
    if (!form.status) return toast.error("يرجى اختيار الحالة");

    try {
      setLoading(true);

      // ✅ إضافة سريعة عبر manual
      if (!record) {
        await addManualAttendance({
          student_id: Number(form.student_id),
          status: form.status,
        }).unwrap();

        toast.success("تم تسجيل الحضور بنجاح");
        onClose?.();
        return;
      }

      // ✅ تعديل: نرسل نفس بيانات السجل القديمة + تحديث الحالة (حتى ما يطلب الباك حقول إضافية)
      await updateAttendance({
        id: record.id,
        institute_branch_id: record?.institute_branch_id,
        batch_id: record?.batch_id,
        attendance_date: record?.attendance_date,
        student_id: Number(form.student_id),
        status: form.status,
      }).unwrap();

      toast.success("تم تعديل السجل بنجاح");
      onClose?.();
    } catch (err) {
      toast.error(err?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-start">
      <div className="w-full sm:w-[520px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#6F013F] font-semibold">
            {record ? "تعديل حضور/غياب" : "تسجيل حضور/غياب"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          {/* ✅ الطالب */}
          <SearchableSelect
            label="اسم الطالب"
            required
            value={form.student_id}
            onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
            options={studentOptions}
            placeholder="اكتب اسم الطالب..."
          />

          {/* ✅ الحالة */}
          <SearchableSelect
            label="الحالة"
            required
            value={form.status}
            onChange={(v) => setForm((p) => ({ ...p, status: v }))}
            options={statusOptions}
            placeholder="اختر الحالة..."
          />

          <StepButtonsSmart
            step={step}
            total={total}
            isEdit={!!record}
            loading={loading}
            onNext={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
