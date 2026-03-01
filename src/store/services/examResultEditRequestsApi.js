// src/store/services/examResultEditRequestsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const examResultEditRequestsApi = createApi({
  reducerPath: "examResultEditRequestsApi",
  ...baseApiConfig,
  tagTypes: ["ExamResultEditRequests"],

  endpoints: (builder) => ({
    getExamResultEditRequests: builder.query({
      query: (params = {}) => ({
        url: "/exam-results/edit-requests",
        method: "GET",
        params,
      }),
      providesTags: [{ type: "ExamResultEditRequests", id: "LIST" }],
    }),

    approveExamResultEditRequest: builder.mutation({
      query: (id) => ({
        url: `/exam-results/edit-requests/${id}/approve`,
        method: "POST", // إذا طلع عندك GET بدّلها
      }),
      invalidatesTags: [{ type: "ExamResultEditRequests", id: "LIST" }],
    }),

    rejectExamResultEditRequest: builder.mutation({
      query: (id) => ({
        url: `/exam-results/edit-requests/${id}/reject`,
        method: "POST", // إذا طلع عندك GET بدّلها
      }),
      invalidatesTags: [{ type: "ExamResultEditRequests", id: "LIST" }],
    }),
  }),
});

export const {
  useGetExamResultEditRequestsQuery,
  useApproveExamResultEditRequestMutation,
  useRejectExamResultEditRequestMutation,
} = examResultEditRequestsApi;
