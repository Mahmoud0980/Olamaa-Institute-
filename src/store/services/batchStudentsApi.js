import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const batchStudentsApi = createApi({
  reducerPath: "batchStudentsApi",
  ...baseApiConfig,
  endpoints: (builder) => ({
    addBatchStudent: builder.mutation({
      query: (data) => ({
        url: "/batch-students",
        method: "POST",
        data,
      }),
    }),
    removeBatchStudent: builder.mutation({
      query: ({ student_id }) => ({
        url: `/batch-students/${student_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useAddBatchStudentMutation, useRemoveBatchStudentMutation } =
  batchStudentsApi;
