// src/store/services/baseApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "@/lib/config/axiosConfig";

/**
 * 🧠 قاعدة مشتركة لكل API مبنية على axiosConfig
 */
export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      });
      return { data: result.data };
    } catch (err) {
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

/**
 * 🧱 إعداد عام موحد لكل APIs
 * - refetchOnFocus, reconnect, mount = false
 * - الكاش يبقى 5 دقائق (300 ثانية)
 */
export const baseApiConfig = {
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
};
