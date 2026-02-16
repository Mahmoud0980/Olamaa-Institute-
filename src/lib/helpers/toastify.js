"use client";

import toast from "react-hot-toast";
import ToastCard from "@/components/common/ToastCard";

const show = (variant, title, message) =>
  toast.custom(
    (t) => (
      <ToastCard t={t} variant={variant} title={title} message={message} />
    ),
    {
      duration: 3500,
    }
  );

export const notify = {
  neutral: (message, title) => show("neutral", title, message),
  info: (message, title) => show("info", title, message),
  success: (message, title) => show("success", title, message),
  warning: (message, title) => show("warning", title, message),
  error: (message, title) => show("error", title, message),
};
