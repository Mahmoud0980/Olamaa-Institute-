import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import ENDPOINTS from "@/lib/constants/endpoints";

/* =====================================================
   axios RAW + Authorization فقط
===================================================== */
const rawAxios = axios.create({
  baseURL: "https://abd990-001-site1.qtempurl.com/api/",
});

// 🔑 أضف التوكن يدويًا
rawAxios.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      const token = parsed?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

/* =====================================================
   baseQuery خاص بـ FormData
===================================================== */
const rawAxiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const result = await rawAxios({
        url,
        method,
        data, // FormData
        params,
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

/* =====================================================
   API
===================================================== */
export const enrollmentsApi = createApi({
  reducerPath: "enrollmentsApi",
  baseQuery: rawAxiosBaseQuery(),
  tagTypes: ["Enrollments"],

  endpoints: (builder) => ({
    addEnrollment: builder.mutation({
      query: (formData) => ({
        url: ENDPOINTS.ENROLLMENTS,
        method: "POST",
        data: formData,
      }),
    }),
  }),
});

export const { useAddEnrollmentMutation } = enrollmentsApi;
