"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Stepper from "@/components/common/Stepper";
import FormInput from "@/components/common/InputField";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import SearchableSelect from "@/components/common/SearchableSelect";

// APIs
import {
  useAddAttendanceMutation,
  useUpdateAttendanceMutation,
  useGetBatchStudentsLastAttendanceQuery,
} from "@/store/services/attendanceApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import { useGetBatchesQuery } from "@/store/services/batchesApi";
import { useGetStudentsQuery } from "@/store/services/studentsApi";

function studentFullName(s) {
  if (!s) return "";
  if (s.full_name) return s.full_name;
  const first = s.first_name || s.name || "";
  const last = s.last_name || s.family_name || s.surname || "";
  return `${first} ${last}`.trim();
}

export default function AddAttendanceModal({ isOpen, onClose, record }) {
  const [addAttendance] = useAddAttendanceMutation();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const { data: branchesRes } = useGetInstituteBranchesQuery();
  const branches = branchesRes?.data || [];

  const { data: batchesRes } = useGetBatchesQuery();
  const batches = batchesRes?.data || [];

  const { data: allStudents = [] } = useGetStudentsQuery();

  const [loading, setLoading] = useState(false);
  const step = 1;
  const total = 1;

  const initialForm = {
    institute_branch_id: "",
    batch_id: "",
    student_id: "",
    attendance_date: "",
    status: "",
  };

  const [form, setForm] = useState(initialForm);

  // طلاب الدفعة (للسيلكت)
  const { data: batchStudentsRes } = useGetBatchStudentsLastAttendanceQuery(
    form.batch_id,
    { skip: !form.batch_id }
  );
  const batchStudents = batchStudentsRes?.data || [];

  const studentsById = useMemo(() => {
    const m = {};
    (allStudents || []).forEach((s) => (m[s.id] = s));
    return m;
  }, [allStudents]);

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: String(b.id), label: b.name })),
    [branches]
  );

  const batchOptions = useMemo(() => {
    const branchId = form.institute_branch_id
      ? Number(form.institute_branch_id)
      : null;

    const list = branchId
      ? batches.filter((b) => b.institute_branch?.id === branchId)
      : batches;

    return list.map((b) => ({ value: String(b.id), label: b.name }));
  }, [batches, form.institute_branch_id]);

  const studentOptions = useMemo(() => {
    // إذا في batch_id: خذ طلاب الدفعة (من endpoint)
    if (form.batch_id) {
      return batchStudents
        .map((row) => {
          const sid = row?.student_id || row?.student?.id;
          const sObj = row?.student || studentsById?.[sid];
          const label = studentFullName(sObj);

          if (!sid || !label) return null;
          return { value: String(sid), label };
        })
        .filter(Boolean);
    }

    // غير هيك: كل الطلاب
    return (allStudents || [])
      .map((s) => {
        const label = studentFullName(s);
        if (!label) return null;
        return { value: String(s.id), label };
      })
      .filter(Boolean);
  }, [form.batch_id, batchStudents, allStudents, studentsById]);

  const statusOptions = [
    { value: "present", label: "موجود" },
    { value: "late", label: "متأخر" },
    { value: "absent", label: "غائب" },
    { value: "excused", label: "إذن" },
  ];

  // fill edit
  useEffect(() => {
    if (!isOpen) return;

    if (record) {
      setForm({
        institute_branch_id: record?.institute_branch_id
          ? String(record.institute_branch_id)
          : "",
        batch_id: record?.batch_id ? String(record.batch_id) : "",
        student_id: record?.student_id ? String(record.student_id) : "",
        attendance_date: record?.attendance_date || "",
        status: record?.status || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [isOpen, record]);

  const handleSubmit = async () => {
    if (!form.institute_branch_id) return toast.error("يرجى اختيار الفرع");
    if (!form.batch_id) return toast.error("يرجى اختيار الشعبة");
    if (!form.student_id) return toast.error("يرجى اختيار الطالب");
    if (!form.attendance_date) return toast.error("التاريخ مطلوب");
    if (!form.status) return toast.error("يرجى اختيار الحالة");

    try {
      setLoading(true);

      const payload = {
        institute_branch_id: Number(form.institute_branch_id),
        batch_id: Number(form.batch_id),
        student_id: Number(form.student_id),
        attendance_date: form.attendance_date,
        status: form.status,
      };

      if (record) {
        await updateAttendance({ id: record.id, ...payload }).unwrap();
        toast.success("تم تعديل السجل بنجاح");
      } else {
        await addAttendance(payload).unwrap();
        toast.success("تم إضافة السجل بنجاح");
      }

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
            {record ? "تعديل سجل حضور" : "إضافة سجل حضور"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <Stepper current={step} total={total} />

        <div className="mt-6 space-y-5">
          {/* ✅ الفرع */}
          <SearchableSelect
            label="الفرع"
            required
            value={form.institute_branch_id}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                institute_branch_id: v,
                batch_id: "",
                student_id: "",
              }))
            }
            options={branchOptions}
            placeholder="اكتب للبحث..."
          />

          {/* ✅ الشعبة */}
          <SearchableSelect
            label="الشعبة"
            required
            value={form.batch_id}
            onChange={(v) =>
              setForm((p) => ({
                ...p,
                batch_id: v,
                student_id: "",
              }))
            }
            options={batchOptions}
            placeholder="اكتب للبحث..."
          />

          {/* ✅ الطالب (اسم + عائلة) */}
          <SearchableSelect
            label="اسم الطالب"
            required
            value={form.student_id}
            onChange={(v) => setForm((p) => ({ ...p, student_id: v }))}
            options={studentOptions}
            placeholder="اكتب اسم الطالب..."
          />

          {/* التاريخ */}
          <FormInput
            type="date"
            label="التاريخ"
            required
            value={form.attendance_date}
            register={{
              onChange: (e) =>
                setForm((p) => ({ ...p, attendance_date: e.target.value })),
            }}
          />

          {/* الحالة */}
          <SearchableSelect
            label="الحالة"
            required
            value={form.status}
            onChange={(v) => setForm((p) => ({ ...p, status: v }))}
            options={statusOptions}
            placeholder="اكتب للبحث..."
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
