import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const batchStudentsApi = createApi({
  reducerPath: "batchStudentsApi",
  ...baseApiConfig,
  tagTypes: ["BatchStudents", "UnassignedStudents"],

  endpoints: (builder) => ({
    addBatchStudent: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.BATCH_STUDENTS,
        method: "POST",
        data,
      }),
      invalidatesTags: ["BatchStudents", "UnassignedStudents"],
    }),

    removeBatchStudent: builder.mutation({
      query: ({ student_id }) => ({
        url: `${ENDPOINTS.BATCH_STUDENTS}/${student_id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BatchStudents", "UnassignedStudents"],
    }),

    // جلب طلاب شعبة معينة مع حالة الحضور والمبلغ المتبقي
    getBatchStudents: builder.query({
      query: (batchId) => ({
        url: `${ENDPOINTS.BATCH_STUDENTS}/${batchId}/students`,
        method: "GET",
      }),
      providesTags: (r, e, batchId) => [
        { type: "BatchStudents", id: `BATCH-${batchId}` },
      ],
    }),

    // جلب الطلاب غير المنتسبين لشعبة معينة
    getUnassignedStudents: builder.query({
      query: ({ batch_id, location_filter = "all" }) => ({
        url: `${ENDPOINTS.BATCH_STUDENTS}/unassigned`,
        method: "GET",
        params: { batch_id, location_filter },
      }),
      providesTags: ["UnassignedStudents"],
    }),

    // إضافة مجموعة طلاب لشعبة
    bulkAssignStudents: builder.mutation({
      query: ({ batch_id, student_ids }) => ({
        url: `${ENDPOINTS.BATCH_STUDENTS}/bulk-assign`,
        method: "POST",
        data: { batch_id, student_ids },
      }),
      invalidatesTags: ["BatchStudents", "UnassignedStudents"],
    }),
  }),
});

export const {
  useAddBatchStudentMutation,
  useRemoveBatchStudentMutation,
  useGetBatchStudentsQuery,
  useLazyGetBatchStudentsQuery,
  useGetUnassignedStudentsQuery,
  useLazyGetUnassignedStudentsQuery,
  useBulkAssignStudentsMutation,
} = batchStudentsApi;
