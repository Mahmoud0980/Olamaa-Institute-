import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const examTypesApi = createApi({
  reducerPath: "examTypesApi",
  ...baseApiConfig,
  tagTypes: ["ExamTypes"],

  endpoints: (builder) => ({
    getExamTypes: builder.query({
      query: () => ({
        url: "/exam-types",
        method: "GET",
      }),
      providesTags: [{ type: "ExamTypes", id: "LIST" }],
    }),
  }),
});

export const { useGetExamTypesQuery } = examTypesApi;
