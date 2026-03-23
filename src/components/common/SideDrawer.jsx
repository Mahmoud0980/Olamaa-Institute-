"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * SideDrawer - A generic side panel component for dashboard forms and details.
 * 
 * @param {boolean} isOpen - Controls visibility.
 * @param {function} onClose - Function to call when closing.
 * @param {string} title - Main title in the header.
 * @param {string} subtitle - Optional secondary text below title.
 * @param {ReactNode} children - Main content of the drawer.
 * @param {ReactNode} footer - Optional sticky footer content.
 * @param {string} widthClass - Custom width class (default: sm:w-[500px]).
 */
export default function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  widthClass = "sm:w-[500px]",
  headerActions,
  scrollContent = true,
  contentClassName = "px-6 py-6",
  mode = "drawer", // "drawer" | "floating-right" | "centered"
}) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex ${mode === "centered" ? "items-center justify-center p-4" : "justify-start"} overflow-hidden`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div 
        className={`relative bg-white shadow-2xl flex flex-col z-10 w-full ${widthClass} ${
          mode === "floating-right" 
            ? "max-h-[85vh] my-auto mr-4 rounded-2xl animate-in fade-in slide-in-from-right-8" 
            : mode === "centered"
            ? "max-h-[90vh] rounded-2xl animate-in zoom-in-95"
            : "h-full animate-in slide-in-from-right"
        } duration-300 ease-out`}
      >
        {/* Header */}
        <div className={`shrink-0 p-6 pb-4 border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-20 ${mode !== "drawer" ? "rounded-t-2xl" : ""}`}>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-[#6F013F] text-xl font-bold tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {headerActions}
              <button
                onClick={onClose}
                className="p-2 -mt-1 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6F013F]/10"
                aria-label="إغلاق"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className={`flex-1 ${
            scrollContent
              ? "overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300"
              : "min-h-0 flex flex-col overflow-hidden"
          } ${contentClassName}`}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`shrink-0 p-6 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-20 ${mode !== "drawer" ? "rounded-b-2xl" : ""}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
