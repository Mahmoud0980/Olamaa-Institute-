// src/store/services/statisticsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const statisticsApi = createApi({
  reducerPath: "statisticsApi",
  ...baseApiConfig,
  endpoints: (builder) => ({
    // 👨‍👩‍👧‍👦 عدد أولياء الأمور
    getTotalGuardians: builder.query({
      query: () => ({
        url: "/guardians/total-guardians",
        method: "GET",
      }),
      transformResponse: (response) => response?.data?.total_guardians ?? 0,
    }),

    // 👨‍💼 عدد الموظفين
    getTotalEmployees: builder.query({
      query: () => ({
        url: "/employees/count",
        method: "GET",
      }),
      transformResponse: (response) => response?.data?.total_employees ?? 0,
    }),

    // 🎓 عدد الطلاب (المجموع + ذكور + إناث)
    getTotalStudents: builder.query({
      query: () => ({
        url: "/students/total-students",
        method: "GET",
      }),
      transformResponse: (response) => ({
        total: response?.data?.total_students ?? 0,
        male: response?.data?.male_students ?? 0,
        female: response?.data?.female_students ?? 0,
      }),
    }),

    // 📊 أداء الدورات (Apex Chart)
    getBatchesPerformance: builder.query({
      query: () => ({
        url: "/batches/performance/all",
        method: "GET",
      }),
      transformResponse: (response) =>
        (response?.data || []).map((item) => ({
          id: item.batch_id,
          name: item.batch_name,
          value: item.percentage ?? 0,
        })),
    }),
    getBatchesStats: builder.query({
      query: () => ({
        url: "/batches/stats",
        method: "GET",
      }),
      transformResponse: (response) => ({
        completed: response?.data?.completed ?? 0,
        notCompleted: response?.data?.not_completed ?? 0,
        total: response?.data?.total ?? 0,
      }),
    }),
  }),
});

export const {
  useGetTotalGuardiansQuery,
  useGetTotalEmployeesQuery,
  useGetTotalStudentsQuery,
  useGetBatchesPerformanceQuery,
  useGetBatchesStatsQuery,
} = statisticsApi;
