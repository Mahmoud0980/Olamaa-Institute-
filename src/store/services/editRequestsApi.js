import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "@/lib/config/axiosConfig";

/* ================= baseQuery ================= */
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
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
export const editRequestsApi = createApi({
  reducerPath: "editRequestsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["EditRequests"],

  endpoints: (builder) => ({
    // GET /payments/{payment_id}/edit-requests
    getPaymentEditRequests: builder.query({
      query: (paymentId) => ({
        url: `/payments/${paymentId}/edit-requests`,
        method: "GET",
      }),
      providesTags: (res, err, paymentId) => [
        { type: "EditRequests", id: `PAYMENT-${paymentId}` },
      ],
    }),

    // POST /edit-requests/{id}/approve
    approveEditRequest: builder.mutation({
      query: (id) => ({
        url: `/edit-requests/${id}/approve`,
        method: "POST",
        data: {},
      }),
      invalidatesTags: (res, err, id) => [{ type: "EditRequests", id: "LIST" }],
    }),

    // POST /edit-requests/{id}/reject
    rejectEditRequest: builder.mutation({
      query: (id) => ({
        url: `/edit-requests/${id}/reject`,
        method: "POST",
        data: {},
      }),
      invalidatesTags: (res, err, id) => [{ type: "EditRequests", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPaymentEditRequestsQuery,
  useApproveEditRequestMutation,
  useRejectEditRequestMutation,
} = editRequestsApi;
