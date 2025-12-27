"use client";

import { useState } from "react";

export default function BatchesBox({ selectedEmployee }) {
  const [selected, setSelected] = useState([]);

  if (!selectedEmployee) {
    return (
      <div className="w-full md:w-1/3 lg:w-1/4">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          مشرف على الدورات
        </h2>

        <div className="bg-white rounded-xl p-4 text-center text-gray-400 text-sm">
          اختر موظفًا لعرض الدورات
        </div>
      </div>
    );
  }

  const assignments = selectedEmployee.batch_assignments || [];

  // toggle checkbox
  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4">
      <h2 className="text-base font-semibold text-gray-700 mb-4">
        مشرف على الدورات
      </h2>

      <div className="bg-white rounded-xl p-4">
        <div className="border border-pink-100 rounded-xl overflow-hidden p-4">
          {/* HEADER */}
          <div className="flex bg-pink-50 text-[13px] text-gray-700 items-center rounded-md p-2">
            <div className="w-[70px] px-3 py-2 text-center">#</div>
            <div className="flex-1 px-3 py-2 text-right">الدورة</div>
          </div>

          {/* BODY */}
          <div className="max-h-80 overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">
                لا توجد دورات لهذا الموظف
              </div>
            ) : (
              assignments.map((a, index) => (
                <div
                  key={a.id}
                  className="flex items-center text-sm text-gray-700"
                >
                  {/* checkbox + رقم */}
                  <div className="w-[70px] flex items-center justify-center gap-2 px-3 py-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selected.includes(a.id)}
                      onChange={() => toggle(a.id)}
                    />
                    <span>{index + 1}</span>
                  </div>

                  {/* اسم الدورة */}
                  <div className="flex-1 px-3 py-2 text-right">
                    {a.batch?.name || "-"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
