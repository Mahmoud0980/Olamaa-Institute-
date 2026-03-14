"use client";

import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "axios";

const isolatedBaseQuery =
  () =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await axios({
        url,
        method,
        data,
        params,
        headers,
        timeout: 30000,
      });

      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;

      return {
        error: {
          status: err?.response?.status,
          data: err?.response?.data || err?.message || "Network Error",
        },
      };
    }
  };

export const messagesApi = createApi({
  reducerPath: "messagesApi",
  baseQuery: isolatedBaseQuery(),
  endpoints: (builder) => ({
    sendSingleSms: builder.mutation({
      query: ({ phone, message, lang = 0 }) => ({
        url: "/api/send-sms",
        method: "POST",
        data: {
          phone,
          message,
          lang,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useSendSingleSmsMutation } = messagesApi;