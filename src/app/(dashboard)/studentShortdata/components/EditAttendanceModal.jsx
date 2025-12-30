"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Calendar from "react-calendar";
import toast from "react-hot-toast";

import SelectInput from "@/components/common/SelectInput";
import FormInput from "@/components/common/InputField";
import GradientButton from "@/components/common/GradientButton";
import { useUpdateDailyRecordMutation } from "@/store/services/studentAttendanceApi";

import "./calendarStyles.css";

export default function EditAttendanceModal({
  isOpen,
  onClose,
  record,
  onSave,
}) {
  const [form, setForm] = useState({
    check: "",
    arrival_time: "",
    leave_time: "",
    date: new Date(),
  });

  const [calendarValue, setCalendarValue] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [updateDailyRecord, { isLoading }] = useUpdateDailyRecordMutation();

  // ================= تحميل بيانات السجل =================
  useEffect(() => {
    if (isOpen && record) {
      const d = record.date ? new Date(record.date) : new Date();

      setForm({
        check: record.status ?? "",
        arrival_time: record.check_in ?? "",
        leave_time: record.check_out ?? "",
        date: d,
      });

      setCalendarValue(d);
      setCurrentMonth(d);
    }
  }, [isOpen, record]);

  // ================= حفظ التعديل =================
  const handleSubmit = async () => {
    if (!record?.student_id) {
      toast.error("بيانات السجل غير مكتملة");
      return;
    }

    const payload = {
      date: form.date.toLocaleDateString("en-CA"),
      status: form.check,
      exit_type: "normal",
    };

    // منطق الحالة
    if (form.check === "present" || form.check === "late") {
      payload.check_in = form.arrival_time || null;
      payload.check_out = form.leave_time || null;
    } else {
      // absent / excused
      payload.check_in = null;
      payload.check_out = null;
    }

    try {
      await updateDailyRecord({
        studentId: record.student_id,
        body: payload,
      }).unwrap();

      toast.success("تم تعديل سجل الحضور بنجاح");
      onSave?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "فشل تعديل سجل الحضور");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-md edit-attendance-moda">
      <div className="w-[450px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            تعديل الغياب والحضور
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* الحالة */}
        <SelectInput
          label="الحالة"
          value={form.check}
          onChange={(e) => {
            const status = e.target.value;

            if (status === "absent") {
              setForm({
                ...form,
                check: status,
                arrival_time: "",
                leave_time: "",
              });
            } else {
              setForm({
                ...form,
                check: status,
              });
            }
          }}
          options={[
            { value: "present", label: "حاضر" },
            { value: "absent", label: "غائب" },
            { value: "late", label: "متأخر" },
          ]}
        />

        {/* الوصول */}
        <div className="mt-5">
          <FormInput
            label="الوصول"
            type="time"
            value={form.arrival_time}
            disabled={form.check === "absent"}
            register={{
              onChange: (e) =>
                setForm({
                  ...form,
                  arrival_time: e.target.value,
                }),
            }}
          />
        </div>

        {/* الانصراف */}
        <div className="mt-5">
          <FormInput
            label="الانصراف"
            type="time"
            value={form.leave_time}
            disabled={form.check === "absent"}
            register={{
              onChange: (e) =>
                setForm({
                  ...form,
                  leave_time: e.target.value,
                }),
            }}
          />
        </div>

        {/* التقويم */}
        <div className="mt-6">
          <Calendar
            value={calendarValue}
            locale="en"
            activeStartDate={currentMonth}
            className="my-calendar"
            onChange={(d) => {
              setCalendarValue(d);
              setForm({ ...form, date: d });
            }}
          />
        </div>

        {/* زر الحفظ */}
        <div className="mt-6 flex justify-end">
          <GradientButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "تعديل"
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
