"use client";
import React from "react";

export default function PaymentsPageSkeleton() {
  return (
    <div dir="rtl" className="p-6 space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-40 bg-gray-200 rounded"></div>
          <div className="h-10 w-40 bg-gray-200 rounded"></div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <div className="h-10 w-full bg-gray-100 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
