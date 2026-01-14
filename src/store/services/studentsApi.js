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
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

/* ================= API ================= */
export const studentsApi = createApi({
  reducerPath: "studentsApi",
  baseQuery: axiosBaseQuery({ baseUrl: "" }),
  tagTypes: ["Students"],

  endpoints: (builder) => ({
    /* ================= LIST (DETAILS) ================= */
    getStudentsDetails: builder.query({
      query: () => ({
        url: "/students/details",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              { type: "Students", id: "DETAILS_LIST" },
              ...result.data.map((s) => ({
                type: "Students",
                id: s.id,
              })),
            ]
          : [{ type: "Students", id: "DETAILS_LIST" }],
    }),

    /* ================= SINGLE DETAILS (LAZY) ================= */
    getStudentDetailsById: builder.query({
      query: (id) => ({
        url: `/students/${id}/details`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Students", id }],
    }),

    /* ================= ADD ================= */
    addStudent: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.STUDENTS,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Students", id: "DETAILS_LIST" }],
    }),

    /* ================= UPDATE ================= */
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.STUDENTS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Students", id },
        { type: "Students", id: "DETAILS_LIST" },
      ],
    }),

    /* ================= DELETE ================= */
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.STUDENTS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Students", id: "DETAILS_LIST" }],
    }),
  }),
});

/* ================= hooks ================= */
export const {
  // queries
  useGetStudentsDetailsQuery,
  useLazyGetStudentDetailsByIdQuery,

  // mutations
  useAddStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = studentsApi;
