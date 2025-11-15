import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const academicBranchesApi = createApi({
  reducerPath: "academicBranchesApi",
  ...baseApiConfig,
  tagTypes: ["AcademicBranches"],

  endpoints: (builder) => ({
    getAcademicBranches: builder.query({
      query: (params) => ({
        url: ENDPOINTS.ACADEMIC_BRANCHES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "AcademicBranches", id })),
              { type: "AcademicBranches", id: "LIST" },
            ]
          : [{ type: "AcademicBranches", id: "LIST" }],
    }),

    getAcademicBranch: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.ACADEMIC_BRANCHES}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "AcademicBranches", id }],
    }),

    addAcademicBranch: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.ACADEMIC_BRANCHES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "AcademicBranches", id: "LIST" }],
    }),

    updateAcademicBranch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.ACADEMIC_BRANCHES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "AcademicBranches", id },
        { type: "AcademicBranches", id: "LIST" },
      ],
    }),

    deleteAcademicBranch: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.ACADEMIC_BRANCHES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "AcademicBranches", id },
        { type: "AcademicBranches", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAcademicBranchesQuery,
  useGetAcademicBranchQuery,
  useAddAcademicBranchMutation,
  useUpdateAcademicBranchMutation,
  useDeleteAcademicBranchMutation,
} = academicBranchesApi;
