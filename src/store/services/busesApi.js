import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const busesApi = createApi({
  reducerPath: "busesApi",
  ...baseApiConfig,
  tagTypes: ["Buses"],

  endpoints: (builder) => ({
    getBuses: builder.query({
      query: (params) => ({
        url: ENDPOINTS.BUSES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Buses", id })),
              { type: "Buses", id: "LIST" },
            ]
          : [{ type: "Buses", id: "LIST" }],
    }),

    getBus: builder.query({
      query: (id) => ({ url: `${ENDPOINTS.BUSES}/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "Buses", id }],
    }),

    addBus: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.BUSES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Buses", id: "LIST" }],
    }),

    updateBus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.BUSES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Buses", id },
        { type: "Buses", id: "LIST" },
      ],
    }),

    deleteBus: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.BUSES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Buses", id },
        { type: "Buses", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBusesQuery,
  useGetBusQuery,
  useAddBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
} = busesApi;
