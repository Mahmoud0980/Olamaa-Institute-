// src/store/services/paymentsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "@/store/services/baseApi";

export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  ...baseApiConfig,
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

    getPayments: builder.query({
      query: () => ({ url: "/payments", method: "GET" }),
      providesTags: ["Payments"],
    }),

    getPaymentById: builder.query({
      query: (id) => ({ url: `/payments/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "Payments", id }],
    }),

    updatePayment: builder.mutation({
      query: ({ id, reason = null, proposed_changes = null, ...payload }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        data: {
          ...payload,
          reason,
          proposed_changes,
        },
      }),
      invalidatesTags: ["Payments"],
    }),

    deletePayment: builder.mutation({
      query: ({ id, reason = null }) => ({
        url: `/payments/${id}`,
        method: "DELETE",
        data: {
          proposed_changes: {}, // مهم لتفادي proposed_changes null بالباك
          reason,
        },
      }),
      invalidatesTags: ["Payments"],
    }),

    getLatestPaymentsPerStudent: builder.query({
      query: ({ student_id, batch_id, institute_branch_id } = {}) => {
        const params = new URLSearchParams();
        if (student_id) params.append("student_id", student_id);
        if (batch_id) params.append("batch_id", batch_id);
        if (institute_branch_id)
          params.append("institute_branch_id", institute_branch_id);

        const qs = params.toString();
        return {
          url: `/payments/latest-per-student${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Payments"],
    }),

    getStudentLatePayments: builder.query({
      query: ({ student_id, batch_id } = {}) => {
        const params = new URLSearchParams();
        if (student_id) params.append("student_id", student_id);
        if (batch_id) params.append("batch_id", batch_id);

        const qs = params.toString();
        return {
          url: `/payments/student-late${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Payments"],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetLatestPaymentsPerStudentQuery,
  useGetStudentLatePaymentsQuery,
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentsApi;
