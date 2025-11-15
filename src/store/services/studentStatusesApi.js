import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const studentStatusesApi = createApi({
  reducerPath: "studentStatusesApi",
  ...baseApiConfig,
  tagTypes: ["StudentStatuses"],

  endpoints: (builder) => ({
    getStudentStatuses: builder.query({
      query: (params) => ({
        url: ENDPOINTS.STUDENT_STATUSES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "StudentStatuses", id })),
              { type: "StudentStatuses", id: "LIST" },
            ]
          : [{ type: "StudentStatuses", id: "LIST" }],
    }),

    getStudentStatus: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.STUDENT_STATUSES}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "StudentStatuses", id }],
    }),

    addStudentStatus: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.STUDENT_STATUSES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "StudentStatuses", id: "LIST" }],
    }),

    updateStudentStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.STUDENT_STATUSES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "StudentStatuses", id },
        { type: "StudentStatuses", id: "LIST" },
      ],
    }),

    deleteStudentStatus: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.STUDENT_STATUSES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "StudentStatuses", id },
        { type: "StudentStatuses", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetStudentStatusesQuery,
  useGetStudentStatusQuery,
  useAddStudentStatusMutation,
  useUpdateStudentStatusMutation,
  useDeleteStudentStatusMutation,
} = studentStatusesApi;
