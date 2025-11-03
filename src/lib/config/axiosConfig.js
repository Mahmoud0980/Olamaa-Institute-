import axios from "axios";
import { getToken, clearAuth } from "../helpers/auth"; // استيراد من lib/auth

const api = axios.create({
  baseURL: "http://james90-001-site1.mtempurl.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // مهلة الطلب (اختياري)
});

// 🟢 إضافة الـ token تلقائيًا قبل كل طلب
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔴 التعامل مع الأخطاء (401 مثلاً)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth(); // حذف بيانات المستخدم
      if (typeof window !== "undefined") {
        window.location.href = "/login"; // إعادة توجيه للـ login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
