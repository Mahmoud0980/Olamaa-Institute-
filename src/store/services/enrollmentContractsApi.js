import { createApi } from "@reduxjs/toolkit/query/react";
import axios from "@/lib/config/axiosConfig";
import ENDPOINTS from "@/lib/constants/endpoints";

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
export const enrollmentContractsApi = createApi({
  reducerPath: "enrollmentContractsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["EnrollmentContracts"],

  endpoints: (builder) => ({
    // 🔍 معاينة الأقساط
    previewInstallments: builder.mutation({
      query: (payload) => ({
        url: "/enrollment-contracts/preview",
        method: "POST",
        data: payload,
      }),
    }),

    // 💾 إنشاء عقد
    addEnrollmentContract: builder.mutation({
      query: (payload) => ({
        url: "/enrollment-contracts",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["EnrollmentContracts"],
    }),

    // 📋 الحصول على كل العقود
    getEnrollmentContracts: builder.query({
      query: (params) => ({
        url: "/enrollment-contracts",
        method: "GET",
        params,
      }),
      providesTags: ["EnrollmentContracts"],
    }),

    // 📄 الحصول على عقد بواسطة ID
    getEnrollmentContractById: builder.query({
      query: (id) => ({
        url: `/enrollment-contracts/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "EnrollmentContracts", id }],
    }),

    // ✏️ تحديث عقد
    updateEnrollmentContract: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/enrollment-contracts/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        "EnrollmentContracts",
        { type: "EnrollmentContracts", id },
      ],
    }),

    // 🗑️ حذف عقد
    deleteEnrollmentContract: builder.mutation({
      query: (id) => ({
        url: `/enrollment-contracts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EnrollmentContracts"],
    }),
  }),
});

export const {
  usePreviewInstallmentsMutation,
  useAddEnrollmentContractMutation,
  useGetEnrollmentContractsQuery,
  useGetEnrollmentContractByIdQuery,
  useLazyGetEnrollmentContractByIdQuery,
  useUpdateEnrollmentContractMutation,
  useDeleteEnrollmentContractMutation,
} = enrollmentContractsApi;
