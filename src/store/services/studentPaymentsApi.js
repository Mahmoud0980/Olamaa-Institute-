import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const studentPaymentsApi = createApi({
  reducerPath: "studentPaymentsApi",
  ...baseApiConfig,

  endpoints: (builder) => ({
    getStudentPaymentsSummary: builder.query({
      query: (id) => ({
        url: `/students/${id}/payments`,
        method: "GET",
      }),

      // بيرجع لنا الـ data مباشرة (نفس اللي عندك بالـ API)
      transformResponse: (response) => response?.data || null,
    }),
  }),
});

export const { useGetStudentPaymentsSummaryQuery } = studentPaymentsApi;
