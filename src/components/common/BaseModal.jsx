"use client";

import { X } from "lucide-react";

export default function BaseModal({
  open,
  title,
  onClose,
  children,
  footer,
  widthClass = "max-w-3xl",
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* modal */}
      <div
        className={`relative w-[95%] ${widthClass} bg-white rounded-2xl shadow-xl border border-gray-200`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-semibold text-[#6F013F]">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>

        {footer ? (
          <div className="px-5 py-4 border-t bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
