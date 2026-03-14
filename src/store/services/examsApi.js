// src/store/services/examsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const examsApi = createApi({
  reducerPath: "examsApi",
  ...baseApiConfig,
  tagTypes: ["Exams", "ExamResults"],

  endpoints: (builder) => ({
    // ======================
    // المذاكرات (Exams)
    // ======================

    getFilteredExams: builder.query({
      query: (params = {}) => ({
        url: "/exams/filtered",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "Exams", id: "LIST" }],
    }),

    getExamById: builder.query({
      query: (id) => ({
        url: `/exams/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Exams", id }],
    }),

    addExam: builder.mutation({
      query: (data) => ({
        url: "/exams",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Exams", id: "LIST" }],
    }),

    updateExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exams/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Exams", id: "LIST" },
        { type: "Exams", id },
      ],
    }),

    deleteExam: builder.mutation({
      query: (id) => ({
        url: `/exams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Exams", id: "LIST" },
        { type: "Exams", id },
      ],
    }),

    // ======================
    // العلامات (Exam Results)
    // ======================

    getStudentExamResults: builder.query({
      query: (params = {}) => ({
        url: "/exam-results/student-exam-results",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "ExamResults", id: "LIST" }],
    }),

    // ✅ NEW: نتائج طالب حسب student_id
    getFilteredExamResults: builder.query({
      query: (params = {}) => ({
        url: "/exam-results/filter",
        method: "GET",
        params,
      }),
      providesTags: (result, error, params) => [
        { type: "ExamResults", id: "LIST" },
        { type: "ExamResults", id: `STUDENT_${params?.student_id || "ALL"}` },
      ],
    }),

    addExamResult: builder.mutation({
      query: (data) => ({
        url: "/exam-results",
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "ExamResults", id: "LIST" }],
    }),

    getExamResultById: builder.query({
      query: (id) => ({
        url: `/exam-results/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "ExamResults", id }],
    }),

    deleteExamResult: builder.mutation({
      query: (id) => ({
        url: `/exam-results/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "ExamResults", id: "LIST" },
        { type: "ExamResults", id },
      ],
    }),

    updateExamResult: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exam-results/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "ExamResults", id: "LIST" },
        { type: "ExamResults", id },
      ],
    }),
  }),
});

export const {
  useGetFilteredExamsQuery,
  useGetExamByIdQuery,

  useAddExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,

  useGetExamResultByIdQuery,
  useUpdateExamResultMutation,
  useDeleteExamResultMutation,

  useGetStudentExamResultsQuery,
  useGetFilteredExamResultsQuery, // ✅ NEW
  useAddExamResultMutation,
} = examsApi;
