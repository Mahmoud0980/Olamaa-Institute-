import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";
import ENDPOINTS from "@/lib/constants/endpoints";

export const knowWaysApi = createApi({
  reducerPath: "knowWaysApi",
  ...baseApiConfig,
  tagTypes: ["KnowWays"],

  endpoints: (builder) => ({
    getKnowWays: builder.query({
      query: (params) => ({
        url: ENDPOINTS.KNOW_WAYS,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "KnowWays", id })),
              { type: "KnowWays", id: "LIST" },
            ]
          : [{ type: "KnowWays", id: "LIST" }],
    }),

    addKnowWay: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.KNOW_WAYS,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "KnowWays", id: "LIST" }],
    }),

    updateKnowWay: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.KNOW_WAYS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "KnowWays", id },
        { type: "KnowWays", id: "LIST" },
      ],
    }),

    deleteKnowWay: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.KNOW_WAYS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "KnowWays", id },
        { type: "KnowWays", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetKnowWaysQuery,
  useAddKnowWayMutation,
  useUpdateKnowWayMutation,
  useDeleteKnowWayMutation,
} = knowWaysApi;
