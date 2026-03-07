"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify } from "@/lib/helpers/toastify";

import SearchableSelect from "@/components/common/SearchableSelect";
import GradientButton from "@/components/common/GradientButton";
import DatePickerSmart from "@/components/common/DatePickerSmart";
import TimePickerSmart from "@/components/common/TimePickerSmart";
import { useUpdateDailyRecordMutation } from "@/store/services/studentAttendanceApi";

function parseTime24To12(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;

  let hh = Number(m[1]);
  const mm = m[2];
  const period = hh >= 12 ? "PM" : "AM";

  if (hh === 0) hh = 12;
  else if (hh > 12) hh -= 12;

  return `${String(hh).padStart(2, "0")}:${mm} ${period}`;
}

function parseTime12To24(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  if (!raw) return null;

  const m = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return raw || null;

  let hh = Number(m[1]);
  const mm = m[2];
  const period = m[3];

  if (period === "AM") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }

  return `${String(hh).padStart(2, "0")}:${mm}`;
}

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
    date: "",
  });

  const [updateDailyRecord, { isLoading }] = useUpdateDailyRecordMutation();

  useEffect(() => {
    if (isOpen && record) {
      setForm({
        check: record.status ?? "",
        arrival_time: record.check_in
          ? parseTime24To12(String(record.check_in).slice(0, 5))
          : "",
        leave_time: record.check_out
          ? parseTime24To12(String(record.check_out).slice(0, 5))
          : "",
        date: record.date ? String(record.date).slice(0, 10) : "",
      });
    }
  }, [isOpen, record]);

  const handleSubmit = async () => {
    if (!record?.student_id) {
      notify.error("بيانات السجل غير مكتملة");
      return;
    }

    if (!form.date) {
      notify.error("يرجى اختيار التاريخ");
      return;
    }

    if (!form.check) {
      notify.error("يرجى اختيار الحالة");
      return;
    }

    const payload = {
      date: form.date,
      status: form.check,
      exit_type: "normal",
    };

    if (form.check === "present" || form.check === "late") {
      payload.check_in = form.arrival_time
        ? parseTime12To24(form.arrival_time)
        : null;
      payload.check_out = form.leave_time
        ? parseTime12To24(form.leave_time)
        : null;
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
      <div
        dir="rtl"
        className="w-full sm:w-[450px] bg-white h-full shadow-xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#6F013F] font-semibold text-lg">
            تعديل الغياب والحضور
          </h2>

          <button type="button" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* الحالة */}
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
          <TimePickerSmart
            label="الوصول"
            value={form.arrival_time}
            disabled={form.check === "absent"}
            onChange={(val) =>
              setForm((prev) => ({
                ...prev,
                arrival_time: val || "",
              }))
            }
          />
        </div>

        {/* الانصراف */}
        <div className="mt-5">
          <TimePickerSmart
            label="الانصراف"
            value={form.leave_time}
            disabled={form.check === "absent"}
            onChange={(val) =>
              setForm((prev) => ({
                ...prev,
                leave_time: val || "",
              }))
            }
          />
        </div>

        {/* التاريخ */}
        <div className="mt-5">
          <DatePickerSmart
            label="التاريخ"
            value={form.date}
            onChange={(iso) =>
              setForm((prev) => ({
                ...prev,
                date: iso || "",
              }))
            }
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

      <div className="flex-1" onClick={onClose} />
    </div>
  );
}
