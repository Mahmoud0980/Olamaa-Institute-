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

    // 📊 أداء الدورات (ApexChart)
    getBatchesPerformance: builder.query({
      query: () => ({
        url: "/batches/performance/all",
        method: "GET",
      }),
      transformResponse: (response) => {
        return (response?.data || []).map((item) => ({
          id: item.batch_id,
          name: item.batch_name,
          value: item.percentage ?? 0, // null → 0
        }));
      },
    }),
  }),
});

export const {
  useGetTotalGuardiansQuery,
  useGetTotalEmployeesQuery,
  useGetBatchesPerformanceQuery,
} = statisticsApi;
