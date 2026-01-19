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
    /* ================= ADD ================= */
    addPayment: builder.mutation({
      query: (payload) => ({
        url: "/payments",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Payments"],
    }),

    /* ================= GET ALL PAYMENTS ================= */
    getPayments: builder.query({
      query: () => ({
        url: "/payments",
        method: "GET",
      }),
      providesTags: ["Payments"],
    }),

    /* ================= GET SINGLE PAYMENT ================= */
    getPaymentById: builder.query({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Payments", id }],
    }),

    /* ================= UPDATE ================= */
    updatePayment: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/payments/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: ["Payments"],
    }),

    /* ================= DELETE ================= */
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
        data: {}, // axios يحتاج data حتى مع delete
      }),
      invalidatesTags: ["Payments"],
    }),

    /* ================= LATEST PER STUDENT =================
       GET /payments/latest-per-student?student_id=&batch_id=&institute_branch_id=
    */
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

    /* ================= STUDENT LATE =================
       GET /payments/student-late?student_id=&batch_id=
    */
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

/* ================= hooks ================= */
export const {
  // queries
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetLatestPaymentsPerStudentQuery,
  useGetStudentLatePaymentsQuery,

  // mutations
  useAddPaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentsApi;
