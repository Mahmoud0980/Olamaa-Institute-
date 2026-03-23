"use client";

import Avatar from "@/components/common/Avatar";

function getPrimaryPhone(student) {
  return (
    student?.phone ||
    student?.mobile ||
    student?.parent_phone ||
    student?.email ||
    "—"
  );
}

export default function StudentInfoCard({ student }) {
  if (!student) return null;

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center">
      <Avatar
        fullName={student?.full_name}
        image={student?.profile_photo_url || null}
      />

      <h2 className="font-bold mt-4 text-gray-900 text-lg">
        {student?.full_name || "—"}
      </h2>

      <p className="text-xs text-gray-500 mt-1" dir="ltr">
        {student?.email || getPrimaryPhone(student)}
      </p>

      <div className="w-full border-t border-gray-100 mt-5 pt-4 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">تاريخ التسجيل</span>
          <span className="font-medium text-gray-800">
            {student?.registration_date || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">الدورة</span>
          <span className="font-medium text-gray-800">
            {student?.batch_name || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">الكنية</span>
          <span className="font-medium text-gray-800">
            {student?.last_name || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-gray-500">عدد المواد</span>
          <span className="font-medium text-gray-800">
            {student?.subjects_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
