// src/store/services/baseApi.js
// import { createApi } from "@reduxjs/toolkit/query/react";
// import axios from "@/lib/config/axiosConfig";
// import { tr } from "zod/v4/locales";

// /**
//  * 🧠 قاعدة مشتركة لكل API مبنية على axiosConfig
//  */
// export const axiosBaseQuery =
//   ({ baseUrl } = { baseUrl: "" }) =>
//   async ({ url, method, data, body, params, headers }) => {
//     try {
//       const result = await axios({
//         url: baseUrl + url,
//         method,
//         data: data ?? body,
//         params,
//         headers: {
//           ...(headers || {}),
//         },
//       });
//       return { data: result.data };
//     } catch (err) {
//       return {
//         error: {
//           status: err.response?.status,
//           data: err.response?.data || err.message,
//         },
//       };
//     }
//   };

// /**
//  * 🧱 إعداد عام موحد لكل APIs
//  * - refetchOnFocus, reconnect, mount = false
//  * - الكاش يبقى 5 دقائق (300 ثانية)
//  */
// export const baseApiConfig = {
//   baseQuery: axiosBaseQuery({ baseUrl: "" }),
//   keepUnusedDataFor: 300,
//   refetchOnFocus: true,
//   refetchOnReconnect: true,
//   refetchOnMountOrArgChange: false,
// };
// src/store/services/baseApi.js
import axios from "@/lib/config/axiosConfig";

export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, body, params, headers }) => {
    try {
      const payload = data ?? body;

      // ✅ جهّز الهيدرز
      const finalHeaders = { ...(headers || {}) };

      // ✅ إذا FormData: لا ترسل Content-Type إطلاقًا
      // (حتى لو axiosConfig حاطه افتراضي)
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      if (isFormData) {
        // حذف من الهيدرز القادمة من endpoint
        delete finalHeaders["Content-Type"];
        delete finalHeaders["content-type"];
      }

      const result = await axios({
        url: baseUrl + url,
        method,
        data: payload,
        params,
        headers: finalHeaders,
        // ✅ مهم: لا تخلّي axios يحاول يحوّل البيانات
        transformRequest: isFormData ? [(d) => d] : undefined,
      });

      return { data: result.data };
    } catch (err) {
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const baseApiConfig = {
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  keepUnusedDataFor: 300,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
};
