import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseApi";

/**
 * 🔧 Helper لتصحيح رابط صورة الطالب
 * - qtempurl يقبل http فقط
 */
const normalizeStudentImage = (student) => {
  if (!student?.profile_photo_url) return student;

  const url = student.profile_photo_url;

  return {
    ...student,
    profile_photo_url: url.startsWith("http") ? url : `http://${url}`,
  };
};

export const studentDetailsApi = createApi({
  reducerPath: "studentDetailsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["StudentDetails"],

  endpoints: (builder) => ({
    // 🔹 كل الطلاب (اختياري)
    studentDetails: builder.query({
      query: () => ({
        url: "/students",
        method: "GET",
      }),
      transformResponse: (response) => {
        // response = { status, message, data }
        return Array.isArray(response.data)
          ? response.data.map(normalizeStudentImage)
          : [];
      },
      providesTags: ["StudentDetails"],
    }),

    // ✅ طالب واحد حسب id
    studentDetailsById: builder.query({
      query: (id) => ({
        url: `/students/${id}/details`,
        method: "GET",
      }),
      transformResponse: (response) => {
        // ⬅️ المفتاح هون
        return normalizeStudentImage(response.data);
      },
      providesTags: (r, e, id) => [{ type: "StudentDetails", id }],
    }),
  }),
});

export const { useStudentDetailsQuery, useStudentDetailsByIdQuery } =
  studentDetailsApi;
