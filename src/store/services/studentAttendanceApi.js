import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const studentAttendanceApi = createApi({
  reducerPath: "studentAttendanceApi",
  ...baseApiConfig,
  tagTypes: ["Attendance"],
  endpoints: (builder) => ({
    getAttendanceLog: builder.query({
      query: ({ id, range = "all" }) => ({
        url: `/students/${id}/attendance-log`,
        method: "GET",
        params: { range },
      }),

      transformResponse: (response) => response.records || [],
      providesTags: ["Attendance"],
    }),
    updateDailyRecord: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/${studentId}/daily-record`,
        method: "PUT",
        body,
      }),

      // مهم لإعادة تحميل جدول الحضور
      invalidatesTags: ["Attendance"],
    }),
  }),
});

export const { useGetAttendanceLogQuery, useUpdateDailyRecordMutation } =
  studentAttendanceApi;
