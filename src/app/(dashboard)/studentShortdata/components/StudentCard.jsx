// "use client";

import { useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Avatar from "../../../../components/common/Avatar";
import "./calendarStyles.css";
import GradientButton from "@/components/common/GradientButton";
import Image from "next/image";

function getPrimaryPhone(student) {
  const guardians = student?.family?.guardians || [];
  const details = guardians.flatMap((g) => g.contact_details || []);

  const primaryPhone = details.find(
    (c) => c.type === "phone" && c.is_primary && c.full_phone_number
  );
  if (primaryPhone) return primaryPhone.full_phone_number;

  const anyPrimary = details.find((c) => c.is_primary);
  return anyPrimary?.full_phone_number || anyPrimary?.value || "—";
}

function isSameMonth(a, b) {
  if (!a || !b) return false;
  return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export default function StudentCard({
  student,
  selectedDate, // (بنتركه موجود حتى ما ينكسر شي قديم)
  onDateChange, // (بنتركه موجود)
  onEditAttendance,

  // ✅ جديد
  activeTab,
  attendanceRange,
  paymentsRange,
  onRangeChange,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthListOpen, setMonthListOpen] = useState(false);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = useMemo(() => new Date(), []);
  const isCurrentMonthShown = isSameMonth(currentMonth, today);

  // ✅ تحديد أي Range بدنا نعرضه حسب التبويب
  const activeRange =
    activeTab === "payments" ? paymentsRange : attendanceRange;

  // ✅ Calendar props (Range mode فقط لما مو الشهر الحالي)
  const selectRange = !isCurrentMonthShown;

  // value حسب نوع التقويم
  const calendarValue = useMemo(() => {
    if (selectRange) {
      if (activeRange?.start && activeRange?.end)
        return [activeRange.start, activeRange.end];
      if (activeRange?.start && !activeRange?.end) return activeRange.start;
      return null;
    } else {
      // الشهر الحالي: المستخدم يختار تاريخ واحد (نعتبره end)
      return activeRange?.end || activeRange?.start || selectedDate || today;
    }
  }, [selectRange, activeRange, selectedDate, today]);

  const handleCalendarChange = (val) => {
    // ✅ إذا كان الشهر الحالي: اختيار تاريخ واحد => من اليوم للتاريخ المختار
    if (!selectRange) {
      const picked = val instanceof Date ? val : today;

      const a = today.toLocaleDateString("en-CA");
      const b = picked.toLocaleDateString("en-CA");
      const start = a <= b ? today : picked;
      const end = a <= b ? picked : today;

      onRangeChange?.({
        tab: activeTab,
        range: { start, end },
      });

      onDateChange?.(picked); // نخلي القديم شغّال إذا في مكان يعتمد عليه
      return;
    }

    // ✅ شهر غير الحالي: Range selection
    if (Array.isArray(val)) {
      const [start, end] = val;
      onRangeChange?.({
        tab: activeTab,
        range: { start: start || null, end: end || null },
      });
      return;
    }

    // بعض الحالات بيرجع Date أول ضغطة بالـ range
    onRangeChange?.({
      tab: activeTab,
      range: { start: val, end: null },
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* بطاقة الطالب */}
      <div className="bg-white shadow-sm  rounded-xl p-5 flex flex-col items-center text-center">
        <Avatar
          fullName={student?.full_name}
          image={student?.profile_photo_url || null}
        />
        <h2 className="font-bold mt-4">{student?.full_name}</h2>
        <p className="text-xs text-gray-500">{getPrimaryPhone(student)}</p>
      </div>

      <div className="text-right text-sm font-semibold">التاريخ</div>

      {/* التقويم */}
      <div className="bg-white  rounded-xl p-4">
        <div className="flex justify-between mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const d = new Date(currentMonth);
                d.setMonth(d.getMonth() - 1);
                setCurrentMonth(d);
              }}
            >
              ❮
            </button>
            <button
              onClick={() => {
                const d = new Date(currentMonth);
                d.setMonth(d.getMonth() + 1);
                setCurrentMonth(d);
              }}
            >
              ❯
            </button>
          </div>

          <div className="relative">
            <button onClick={() => setMonthListOpen(!monthListOpen)}>
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </button>

            {monthListOpen && (
              <div className="absolute right-0 bg-white border rounded shadow w-36 z-50">
                {months.map((m, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      const d = new Date(currentMonth);
                      d.setMonth(i);
                      setCurrentMonth(d);
                      setMonthListOpen(false);
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Calendar
          onChange={handleCalendarChange}
          value={calendarValue}
          activeStartDate={currentMonth}
          locale="en"
          className="my-calendar"
          selectRange={selectRange}
        />
      </div>

      {/* زر التعديل */}
      <div className="flex justify-end">
        <GradientButton
          onClick={onEditAttendance}
          rightIcon={
            <Image src="/icons/editbtn.png" alt="edit" width={18} height={18} />
          }
        >
          تعديل
        </GradientButton>
      </div>
    </div>
  );
}
