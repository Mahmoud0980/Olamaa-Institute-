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
  }),
});

export const {
  usePreviewInstallmentsMutation,
  useAddEnrollmentContractMutation,
} = enrollmentContractsApi;
