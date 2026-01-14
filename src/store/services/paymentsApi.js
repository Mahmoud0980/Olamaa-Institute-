import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "@/lib/config/axiosConfig";

/* ================= baseQuery ================= */
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
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

/* ================= API ================= */
export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Payments"],

  endpoints: (builder) => ({
    addPayment: builder.mutation({
      query: (payload) => ({
        url: "/payments",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Payments"],
    }),
  }),
});

export const { useAddPaymentMutation } = paymentsApi;
