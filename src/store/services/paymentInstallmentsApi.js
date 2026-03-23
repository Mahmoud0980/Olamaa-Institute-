import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const paymentInstallmentsApi = createApi({
  reducerPath: "paymentInstallmentsApi",
  ...baseApiConfig,
  tagTypes: ["PaymentInstallments"],
  endpoints: (builder) => ({
    // ✅ جلب كل الأقساط
    getPaymentInstallments: builder.query({
      query: (params) => ({
        url: "/payment-installments",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result?.data)
          ? [
              ...(Array.isArray(result?.data) ? result.data : Array.isArray(result?.data?.data) ? result.data.data : []).map((item) => ({
                type: "PaymentInstallments",
                id: item.id,
              })),
              { type: "PaymentInstallments", id: "LIST" },
            ]
          : [{ type: "PaymentInstallments", id: "LIST" }],
    }),

    // ✅ جلب الأقساط بحسب العقد
    getPaymentInstallmentsByContract: builder.query({
      query: (enrollment_contract_id) => ({
        url: "/payment-installments",
        method: "GET",
        params: { enrollment_contract_id },
      }),
      providesTags: (result, error, arg) =>
        Array.isArray(result?.data)
          ? [
              ...(Array.isArray(result?.data) ? result.data : Array.isArray(result?.data?.data) ? result.data.data : []).map((item) => ({
                type: "PaymentInstallments",
                id: item.id,
              })),
              { type: "PaymentInstallments", id: `CONTRACT-${arg}` },
            ]
          : [{ type: "PaymentInstallments", id: `CONTRACT-${arg}` }],
    }),

    // ✅ جلب قسط واحد
    getPaymentInstallmentById: builder.query({
      query: (id) => ({
        url: `/payment-installments/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "PaymentInstallments", id },
      ],
    }),

    // ✅ إضافة قسط
    addPaymentInstallment: builder.mutation({
      query: (body) => ({
        url: "/payment-installments",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PaymentInstallments", id: "LIST" },
        {
          type: "PaymentInstallments",
          id: `CONTRACT-${arg?.enrollment_contract_id}`,
        },
      ],
    }),

    // ✅ تعديل قسط
    updatePaymentInstallment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payment-installments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "PaymentInstallments", id: arg.id },
        { type: "PaymentInstallments", id: "LIST" },
        {
          type: "PaymentInstallments",
          id: `CONTRACT-${arg?.enrollment_contract_id}`,
        },
      ],
    }),

    // ✅ حذف قسط
    deletePaymentInstallment: builder.mutation({
      query: (id) => ({
        url: `/payment-installments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PaymentInstallments", id },
        { type: "PaymentInstallments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPaymentInstallmentsQuery,
  useGetPaymentInstallmentsByContractQuery,
  useGetPaymentInstallmentByIdQuery,
  useAddPaymentInstallmentMutation,
  useUpdatePaymentInstallmentMutation,
  useDeletePaymentInstallmentMutation,
} = paymentInstallmentsApi;
