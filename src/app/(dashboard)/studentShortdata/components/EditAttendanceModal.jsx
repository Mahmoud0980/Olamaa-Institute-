"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Calendar from "react-calendar";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect"; // ✅ بدل SelectInput
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
      notify.error("بيانات السجل غير مكتملة");
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
      payload.check_in = null;
      payload.check_out = null;
    }

    try {
      await updateDailyRecord({
        studentId: record.student_id,
        body: payload,
      }).unwrap();

      notify.success("تم تعديل سجل الحضور بنجاح");
      onSave?.();
      onClose();
    } catch (err) {
      console.error(err);
      notify.error(err?.data?.message || "فشل تعديل سجل الحضور");
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: "present", label: "حاضر" },
    { value: "absent", label: "غائب" },
    { value: "late", label: "متأخر" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-md edit-attendance-modal">
      <div className="w-[450px] bg-white h-full shadow-xl p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            تعديل الغياب والحضور
          </h2>
          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* الحالة ✅ SearchableSelect */}
        <SearchableSelect
          label="الحالة"
          value={form.check}
          onChange={(val) => {
            const status = val;

            if (status === "absent") {
              setForm((prev) => ({
                ...prev,
                check: status,
                arrival_time: "",
                leave_time: "",
              }));
            } else {
              setForm((prev) => ({
                ...prev,
                check: status,
              }));
            }
          }}
          options={statusOptions}
          placeholder="اختر الحالة..."
          allowClear
        />

        {/* الوصول */}
        <div className="mt-5">
          <FormInput
            label="الوصول"
            type="time"
            value={form.arrival_time}
            disabled={form.check === "absent"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                arrival_time: e.target.value,
              }))
            }
          />
        </div>

        {/* الانصراف */}
        <div className="mt-5">
          <FormInput
            label="الانصراف"
            type="time"
            value={form.leave_time}
            disabled={form.check === "absent"}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                leave_time: e.target.value,
              }))
            }
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
              setForm((prev) => ({ ...prev, date: d }));
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
