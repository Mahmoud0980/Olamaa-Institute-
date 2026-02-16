"use client";

import toast from "react-hot-toast";
import { X, Info, Check, AlertTriangle, Ban } from "lucide-react";

const VARIANTS = {
  neutral: {
    bg: "bg-gray-100",
    iconWrap: "bg-white/80",
    icon: Info,
    iconColor: "text-gray-700",
    title: "Neutral Toast",
  },
  info: {
    bg: "bg-blue-50",
    iconWrap: "bg-white/80",
    icon: Info,
    iconColor: "text-blue-600",
    title: "Info",
  },
  success: {
    bg: "bg-emerald-50",
    iconWrap: "bg-white/80",
    icon: Check,
    iconColor: "text-emerald-600",
    title: "Success",
  },
  warning: {
    bg: "bg-orange-50",
    iconWrap: "bg-white/80",
    icon: AlertTriangle,
    iconColor: "text-orange-600",
    title: "Warning",
  },
  error: {
    bg: "bg-rose-50",
    iconWrap: "bg-white/80",
    icon: Ban,
    iconColor: "text-rose-600",
    title: "Error",
  },
};

export default function ToastCard({ t, variant = "neutral", title, message }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;
  const Icon = v.icon;

  return (
    <div
      className={[
        "w-full sm:w-[420px] max-w-[92vw]",
        "rounded-2xl",
        "px-3 py-3 sm:px-4 sm:py-4",
        "shadow-[0_14px_26px_rgba(0,0,0,0.08)]",
        "flex items-start gap-3",
        "transition-all",
        v.bg,
        t.visible ? "animate-enter" : "animate-leave",
      ].join(" ")}
      dir="rtl"
    >
      {/* Icon */}
      <div
        className={[
          "w-9 h-9 sm:w-10 sm:h-10",
          "rounded-xl grid place-items-center flex-shrink-0",
          v.iconWrap,
        ].join(" ")}
      >
        <Icon className={["w-4 h-4 sm:w-5 sm:h-5", v.iconColor].join(" ")} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="font-semibold text-gray-900 text-sm sm:text-base">
          {title || v.title}
        </div>

        {message && (
          <div className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
            {message}
          </div>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-1.5 sm:p-2 rounded-xl hover:bg-black/5 text-gray-700"
        aria-label="Close"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}
