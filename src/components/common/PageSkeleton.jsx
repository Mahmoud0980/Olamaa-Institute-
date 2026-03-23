"use client";
import React from "react";
import TableSkeleton from "@/components/common/TableSkeleton";
import Skeleton from "@/components/common/Skeleton";

/**
 * Generic Page Skeleton Component
 * Provides a loading state for dashboard pages including header, actions, and table.
 * 
 * @param {boolean} title - Whether to show the title skeleton.
 * @param {boolean} subtitle - Whether to show the subtitle skeleton.
 * @param {boolean} actions - Whether to show the actions section skeleton.
 * @param {Array} tableHeaders - Headers for the TableSkeleton.
 * @param {number} rows - Number of rows for the TableSkeleton.
 * @param {string} containerClassName - Custom classes for the outer container.
 */
export default function PageSkeleton({
  title = true,
  subtitle = true,
  actions = true,
  tableHeaders = [],
  rows = 6,
  containerClassName = "",
}) {
  return (
    <div
      dir="rtl"
      className={`w-full h-full p-6 flex flex-col items-center justify-start animate-pulse ${containerClassName}`}
    >
      {/* Header Section */}
      <div className="w-full flex flex-col items-start text-right mt-6">
        {title && <Skeleton width="120px" height="24px" className="mb-2 bg-gray-200 rounded" />}
        {subtitle && <Skeleton width="200px" height="14px" className="mb-5 bg-gray-100 rounded" />}

        {/* Action Buttons Section */}
        {actions && (
          <div className="flex justify-between items-center w-full flex-wrap gap-3">
            <div className="flex flex-row items-center gap-2">
              <Skeleton width="100px" height="36px" className="rounded bg-gray-200" />
              <Skeleton width="100px" height="36px" className="rounded bg-gray-200" />
              <Skeleton width="100px" height="36px" className="rounded bg-gray-200" />
            </div>

            <div className="flex flex-col gap-3 items-end">
              <div className="flex items-center gap-2">
                <Skeleton width="50px" height="14px" className="bg-gray-200 rounded" />
                <Skeleton width="220px" height="36px" className="rounded bg-gray-200" />
              </div>
              <div className="flex items-center gap-3 justify-end">
                <Skeleton width="80px" height="36px" className="rounded bg-gray-200" />
                <Skeleton width="80px" height="36px" className="rounded bg-gray-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="w-full mt-10">
         <TableSkeleton 
            headers={tableHeaders} 
            rows={rows} 
            showPagination={true} 
            containerClassName="!p-4"
         />
      </div>
    </div>
  );
}
