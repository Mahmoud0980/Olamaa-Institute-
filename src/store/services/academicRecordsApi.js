import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const academicRecordsApi = createApi({
  reducerPath: "academicRecordsApi",
  ...baseApiConfig,
  tagTypes: ["AcademicRecords"],

  endpoints: (builder) => ({
    getRecords: builder.query({
      query: (params) => ({
        url: ENDPOINTS.ACADEMIC_RECORDS,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "AcademicRecords",
                id,
              })),
              { type: "AcademicRecords", id: "LIST" },
            ]
          : [{ type: "AcademicRecords", id: "LIST" }],
    }),

    getRecord: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.ACADEMIC_RECORDS}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "AcademicRecords", id }],
    }),

    addRecord: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.ACADEMIC_RECORDS,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "AcademicRecords", id: "LIST" }],
    }),

    updateRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.ACADEMIC_RECORDS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "AcademicRecords", id },
        { type: "AcademicRecords", id: "LIST" },
      ],
    }),

    deleteRecord: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.ACADEMIC_RECORDS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "AcademicRecords", id },
        { type: "AcademicRecords", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetRecordsQuery,
  useGetRecordQuery,
  useAddRecordMutation,
  useUpdateRecordMutation,
  useDeleteRecordMutation,
} = academicRecordsApi;
