// import axios from "axios";
// import { getToken, clearAuth } from "../helpers/auth";

// const api = axios.create({
//   baseURL: "https://norma910-001-site1.mtempurl.com/api/",
//   //baseURL: "https://olamaa-institute.onrender.com/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 15000, // مهلة الطلب (اختياري)
// });

// //  إضافة الـ token تلقائيًا قبل كل طلب
// api.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// //  التعامل مع الأخطاء (401 مثلاً)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       clearAuth(); // حذف بيانات المستخدم
//       if (typeof window !== "undefined") {
//         window.location.href = "/login"; // إعادة توجيه للـ login
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;
import axios from "axios";
import { getToken, clearAuth } from "../helpers/auth";

const api = axios.create({
  baseURL: "https://norma910-001-site1.mtempurl.com/api/",
  timeout: 15000,
  // ❌ احذف Content-Type من هنا
});

// إضافة الـ token + ضبط Content-Type حسب نوع الداتا
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ إذا FormData لا تضع Content-Type أبداً
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    } else {
      // ✅ للطلبات العادية JSON (POST/PUT/PATCH)
      // (GET غالباً ما يحتاج)
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// التعامل مع الأخطاء (401 مثلاً)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
