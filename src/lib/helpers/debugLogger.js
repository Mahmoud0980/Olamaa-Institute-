"use client";

const STORAGE_KEY = "app_debug_logs";

export const debugLogger = {
  log: (message, data = null) => {
    if (typeof window === "undefined") return;
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      logs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: "log",
        message,
        data: data ? JSON.stringify(data) : null,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // keep last 100
    } catch (e) {
      console.error("Failed to write to debug log", e);
    }
  },

  error: (err, context = "") => {
    if (typeof window === "undefined") return;
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      
      let errorMsg = "Unknown Error";
      let errorData = null;

      if (typeof err === "string") {
        errorMsg = err;
      } else if (err?.data?.message) {
        errorMsg = err.data.message;
        errorData = err.data;
      } else if (err?.message) {
        errorMsg = err.message;
        errorData = err;
      } else if (err?.data?.errors) {
        errorMsg = Object.values(err.data.errors).flat().join(", ");
        errorData = err.data.errors;
      }

      logs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type: "error",
        message: context ? `[${context}] ${errorMsg}` : errorMsg,
        data: errorData ? JSON.stringify(errorData) : null,
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error("Failed to write to debug error log", e);
    }
  },

  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },

  getAll: () => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
};
