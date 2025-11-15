"use client";
import React from "react";

export default function StudentsSkeleton() {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-4 animate-pulse">
      {/* رأس الجدول الوهمي */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-24 bg-pink-100 rounded"></div>
        <div className="flex gap-3">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* صفوف الجدول الوهمية */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-3 items-center bg-pink-50 p-3 rounded-lg"
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
  );
}
