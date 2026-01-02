// src/store/services/attendanceApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

const API = ""; // ✅ هون

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  ...baseApiConfig,
  tagTypes: ["Attendance", "BatchesLastAttendance"],

  endpoints: (builder) => ({
    // GET /api/attendance
    getAttendance: builder.query({
      query: (params) => ({
        url: `${API}${ENDPOINTS.ATTENDANCE}`,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Attendance", id })),
              { type: "Attendance", id: "LIST" },
            ]
          : [{ type: "Attendance", id: "LIST" }],
    }),

    // GET /api/attendance/:id
    getAttendanceRecord: builder.query({
      query: (id) => ({
        url: `${API}${ENDPOINTS.ATTENDANCE}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Attendance", id }],
    }),

    // POST /api/attendance
    addAttendance: builder.mutation({
      query: (data) => ({
        url: `${API}${ENDPOINTS.ATTENDANCE}`,
        method: "POST",
        data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Attendance", id: "LIST" },
        { type: "BatchesLastAttendance", id: arg?.batch_id ?? "LIST" },
      ],
    }),

    // PUT /api/attendance/:id
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API}${ENDPOINTS.ATTENDANCE}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Attendance", id: arg?.id },
        { type: "Attendance", id: "LIST" },
        { type: "BatchesLastAttendance", id: arg?.batch_id ?? "LIST" },
      ],
    }),

    // DELETE /api/attendance/:id
    deleteAttendance: builder.mutation({
      query: (arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        return {
          url: `${API}${ENDPOINTS.ATTENDANCE}/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (r, e, arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        const batchId = typeof arg === "object" ? arg.batchId : null;
        return [
          { type: "Attendance", id },
          { type: "Attendance", id: "LIST" },
          { type: "BatchesLastAttendance", id: batchId ?? "LIST" },
        ];
      },
    }),

    // GET /api/batches/:batch/students/last-attendance
    getBatchStudentsLastAttendance: builder.query({
      query: (batchId) => ({
        url: `${API}${ENDPOINTS.BATCHES}/${batchId}/students/last-attendance`,
        method: "GET",
      }),
      providesTags: (r, e, batchId) => [
        { type: "BatchesLastAttendance", id: batchId },
      ],
    }),
  }),
});

export const {
  useGetAttendanceQuery,
  useGetAttendanceRecordQuery,
  useAddAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetBatchStudentsLastAttendanceQuery,
} = attendanceApi;
