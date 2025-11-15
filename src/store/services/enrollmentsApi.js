import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const enrollmentsApi = createApi({
  reducerPath: "enrollmentsApi",
  ...baseApiConfig,
  tagTypes: ["Enrollments"],

  endpoints: (builder) => ({
    addEnrollment: builder.mutation({
      query: (payload) => ({
        headers: { "Content-Type": "multipart/form-data" },
        url: ENDPOINTS.ENROLLMENTS,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Enrollments"],
    }),
  }),
});

export const { useAddEnrollmentMutation } = enrollmentsApi;
