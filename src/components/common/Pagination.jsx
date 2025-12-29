"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = "",
  hideIfSinglePage = false,
}) {
  const isSingle = totalPages <= 1;

  if (hideIfSinglePage && isSingle) return null;

  const goTo = (p) => {
    if (!onPageChange) return;
    const next = Math.min(Math.max(1, Number(p) || 1), totalPages);
    onPageChange(next);
  };

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className={`flex justify-center items-center gap-3 mt-6 ${className}`}>
      {/* FIRST + PREV (RTL-friendly) */}
      <div className="flex items-center gap-2">
        <button
          disabled={!canPrev}
          onClick={() => goTo(1)}
          className="p-2 border rounded-md bg-white disabled:opacity-40"
          aria-label="الذهاب للصفحة الأولى"
          title="الذهاب للصفحة الأولى"
        >
          <ChevronsRight size={18} />
        </button>

        <button
          disabled={!canPrev}
          onClick={() => goTo(page - 1)}
          className="p-2 border rounded-md bg-white disabled:opacity-40"
          aria-label="الصفحة السابقة"
          title="الصفحة السابقة"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* LABEL */}
      <span className="text-gray-600 text-sm">
        صفحة {page} من {totalPages}
      </span>

      {/* NEXT + LAST */}
      <div className="flex items-center gap-2">
        <button
          disabled={!canNext}
          onClick={() => goTo(page + 1)}
          className="p-2 border rounded-md bg-white disabled:opacity-40"
          aria-label="الصفحة التالية"
          title="الصفحة التالية"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          disabled={!canNext}
          onClick={() => goTo(totalPages)}
          className="p-2 border rounded-md bg-white disabled:opacity-40"
          aria-label="الذهاب للصفحة الأخيرة"
          title="الذهاب للصفحة الأخيرة"
        >
          <ChevronsLeft size={18} />
        </button>
      </div>
    </div>
  );
}
