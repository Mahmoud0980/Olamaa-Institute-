import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "@/lib/config/axiosConfig";
import ENDPOINTS from "@/lib/constants/endpoints";

// 🧩 baseQuery مخصص يعتمد على Axios نفسه
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

// 🚀 إنشاء الـ API مع إعدادات الأداء
export const studentsApi = createApi({
  reducerPath: "studentsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Students"], // 👈 لتفعيل caching ذكي وتحديثات جزئية
  endpoints: (builder) => ({
    // ✅ جلب الطلاب
    getStudents: builder.query({
      query: (params) => ({
        url: ENDPOINTS.STUDENTS,
        method: "GET",
        params,
      }),
      providesTags: ["Students"],

      transformResponse: (response) => response?.data || response, // يسهّل شكل البيانات
    }),

    // ✅ مثال لاحق: حذف طالب (يحدث القائمة تلقائياً)
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.STUDENTS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"], // يجبر إعادة التحديث فقط عند الحذف
    }),

    // ✅ مثال لاحق: إضافة طالب جديد
    addStudent: builder.mutation({
      query: (newStudent) => ({
        url: ENDPOINTS.STUDENTS,
        method: "POST",
        data: newStudent,
      }),
      invalidatesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useDeleteStudentMutation,
  useAddStudentMutation,
} = studentsApi;
