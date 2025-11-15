import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const batchesApi = createApi({
  reducerPath: "batchesApi",
  ...baseApiConfig,
  tagTypes: ["Batches"],

  endpoints: (builder) => ({
    getBatches: builder.query({
      query: (params) => ({
        url: ENDPOINTS.BATCHES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Batches", id })),
              { type: "Batches", id: "LIST" },
            ]
          : [{ type: "Batches", id: "LIST" }],
    }),

    getBatch: builder.query({
      query: (id) => ({ url: `${ENDPOINTS.BATCHES}/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "Batches", id }],
    }),

    addBatch: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.BATCHES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Batches", id: "LIST" }],
    }),

    updateBatch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.BATCHES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Batches", id },
        { type: "Batches", id: "LIST" },
      ],
    }),

    deleteBatch: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.BATCHES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Batches", id },
        { type: "Batches", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBatchesQuery,
  useGetBatchQuery,
  useAddBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} = batchesApi;
