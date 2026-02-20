"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

function buildPages(page, totalPages, siblingCount = 1) {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, totalPages);

  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  const firstPage = 1;
  const lastPage = totalPages;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => i + 1,
    );
    return [...leftRange, "...", lastPage];
  }

  if (showLeftDots && !showRightDots) {
    const rightStart = totalPages - (2 + siblingCount * 2);
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, i) => rightStart + i,
    );
    return [firstPage, "...", ...rightRange];
  }

  const middleRange = Array.from(
    { length: siblingCount * 2 + 1 },
    (_, i) => leftSibling + i,
  );

  return [firstPage, "...", ...middleRange, "...", lastPage];
}

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = "",
  hideIfSinglePage = false,
  siblingCount = 1,
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

  const pages = buildPages(page, totalPages, siblingCount);

  // ====== Soft Pink Theme (F4D3E3) ======
  const shell =
    "inline-flex items-center gap-1.5 rounded-full  px-2.5 py-1.5 " +
    "bg-white/70 backdrop-blur shadow-xs";

  const iconBtn =
    "h-8 w-8 inline-flex items-center justify-center rounded-full border border-gray-200 " +
    "bg-white text-gray-700 transition " +
    "hover:bg-[#F4D3E3] hover:border-[#F4D3E3] hover:text-gray-900 " +
    "active:scale-[0.98] " +
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white";

  const numBtn =
    "h-8 min-w-8 px-2.5 inline-flex items-center justify-center rounded-full border border-gray-200 " +
    "text-[13px] font-medium bg-white text-gray-700 transition " +
    "hover:bg-[#F4D3E3] hover:border-[#F4D3E3] hover:text-gray-900 " +
    "active:scale-[0.98]";

  // Active أكبر شوي + لون وردي واضح
  const numActive =
    "h-9 min-w-9 px-3 text-[14px] " +
    "bg-[#F4D3E3] border-[#F4D3E3] text-gray-900 " +
    "shadow-sm scale-[1.06]";

  const dots = "px-1 text-gray-400 select-none";

  return (
    <div className={`flex justify-center mt-2 ${className}`}>
      <div className={shell}>
        {/* FIRST + PREV (RTL-friendly icons) */}
        <button
          disabled={!canPrev}
          onClick={() => goTo(1)}
          className={iconBtn}
          aria-label="الذهاب للصفحة الأولى"
          title="الذهاب للصفحة الأولى"
        >
          <ChevronsRight size={16} />
        </button>

        <button
          disabled={!canPrev}
          onClick={() => goTo(page - 1)}
          className={iconBtn}
          aria-label="الصفحة السابقة"
          title="الصفحة السابقة"
        >
          <ChevronRight size={16} />
        </button>

        {/* NUMBERS (force LTR so it shows 1 2 3 ...) */}
        <div className="flex items-center gap-1.5 px-1" dir="rtl">
          {pages.map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className={dots}>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`${numBtn} ${p === page ? numActive : ""}`}
                aria-current={p === page ? "page" : undefined}
                aria-label={`الذهاب للصفحة ${p}`}
                title={`الذهاب للصفحة ${p}`}
              >
                {p}
              </button>
            ),
          )}
        </div>

        {/* NEXT + LAST */}
        <button
          disabled={!canNext}
          onClick={() => goTo(page + 1)}
          className={iconBtn}
          aria-label="الصفحة التالية"
          title="الصفحة التالية"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          disabled={!canNext}
          onClick={() => goTo(totalPages)}
          className={iconBtn}
          aria-label="الذهاب للصفحة الأخيرة"
          title="الذهاب للصفحة الأخيرة"
        >
          <ChevronsLeft size={16} />
        </button>
      </div>
    </div>
  );
}
