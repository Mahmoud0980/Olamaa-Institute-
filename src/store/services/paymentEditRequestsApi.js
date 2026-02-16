// src/store/services/paymentEditRequestsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "@/store/services/baseApi";

export const paymentEditRequestsApi = createApi({
  reducerPath: "paymentEditRequestsApi",
  ...baseApiConfig,
  tagTypes: ["PaymentEditRequests"],

  endpoints: (builder) => ({
    getPaymentEditRequests: builder.query({
      query: () => ({
        url: "/payments/edit-requests",
        method: "GET",
      }),
      providesTags: ["PaymentEditRequests"],
    }),

    approvePaymentEditRequest: builder.mutation({
      query: (id) => ({
        url: `/payments/edit-requests/${id}/approve`,
        method: "PUT",
        data: {},
      }),
      invalidatesTags: ["PaymentEditRequests"],
    }),

    rejectPaymentEditRequest: builder.mutation({
      query: (id) => ({
        url: `/payments/edit-requests/${id}/reject`,
        method: "PUT",
        data: {},
      }),
      invalidatesTags: ["PaymentEditRequests"],
    }),
  }),
});

export const {
  useGetPaymentEditRequestsQuery,
  useApprovePaymentEditRequestMutation,
  useRejectPaymentEditRequestMutation,
} = paymentEditRequestsApi;
