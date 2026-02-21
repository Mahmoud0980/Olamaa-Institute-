// store/services/logsApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const logsApi = createApi({
  reducerPath: "logsApi",
  ...baseApiConfig,
  tagTypes: ["Logs"],

  endpoints: (builder) => ({
    getLogs: builder.query({
      query: () => ({
        url: "/audits",
        method: "GET",
      }),
      providesTags: ["Logs"],
    }),
  }),
});

export const { useGetLogsQuery } = logsApi;
