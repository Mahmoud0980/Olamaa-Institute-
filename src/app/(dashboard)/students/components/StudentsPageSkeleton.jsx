"use client";
import React from "react";

export default function StudentsPageSkeleton() {
  return (
    <div
      dir="rtl"
      className="w-full h-full p-6 flex flex-col items-center justify-start animate-pulse"
    >
      {/* العنوان */}
      <div className="w-full flex flex-col items-start text-right mt-6">
        <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-48 bg-gray-100 rounded mb-5"></div>

        {/* الأزرار العلوية */}
        <div className="flex justify-between items-center w-full flex-wrap gap-3">
          <div className="flex flex-row items-center gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-gray-200 rounded"></div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-12 bg-gray-200 rounded"></div>
              <div className="h-8 w-[220px] bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* الجدول الوهمي */}
      <div className="w-full mt-10 bg-white border border-gray-200 shadow-sm rounded-xl p-4">
        <div className="h-4 w-32 bg-gray-200 mb-4 rounded"></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-3 bg-pink-50 p-3 rounded-lg"
            >
              <div className="h-3 w-4 bg-gray-200 rounded"></div>
              <div className="h-3 w-10 bg-gray-200 rounded"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
              <div className="flex justify-end gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
