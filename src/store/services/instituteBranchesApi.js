import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const instituteBranchesApi = createApi({
  reducerPath: "instituteBranchesApi",
  ...baseApiConfig,
  tagTypes: ["InstituteBranches"],

  endpoints: (builder) => ({
    getInstituteBranches: builder.query({
      query: (params) => ({
        url: ENDPOINTS.INSTITUTE_BRANCHES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "InstituteBranches", id })),
              { type: "InstituteBranches", id: "LIST" },
            ]
          : [{ type: "InstituteBranches", id: "LIST" }],
    }),

    getInstituteBranch: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.INSTITUTE_BRANCHES}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "InstituteBranches", id }],
    }),

    addInstituteBranch: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.INSTITUTE_BRANCHES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "InstituteBranches", id: "LIST" }],
    }),

    updateInstituteBranch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.INSTITUTE_BRANCHES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "InstituteBranches", id },
        { type: "InstituteBranches", id: "LIST" },
      ],
    }),

    deleteInstituteBranch: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.INSTITUTE_BRANCHES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "InstituteBranches", id },
        { type: "InstituteBranches", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetInstituteBranchesQuery,
  useGetInstituteBranchQuery,
  useAddInstituteBranchMutation,
  useUpdateInstituteBranchMutation,
  useDeleteInstituteBranchMutation,
} = instituteBranchesApi;
