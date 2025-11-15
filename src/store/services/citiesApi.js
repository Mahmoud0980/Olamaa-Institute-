import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const citiesApi = createApi({
  reducerPath: "citiesApi",
  ...baseApiConfig,
  tagTypes: ["Cities"],

  endpoints: (builder) => ({
    getCities: builder.query({
      query: (params) => ({
        url: ENDPOINTS.CITIES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Cities", id })),
              { type: "Cities", id: "LIST" },
            ]
          : [{ type: "Cities", id: "LIST" }],
    }),

    getCity: builder.query({
      query: (id) => ({ url: `${ENDPOINTS.CITIES}/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "Cities", id }],
    }),

    addCity: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.CITIES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Cities", id: "LIST" }],
    }),

    updateCity: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.CITIES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Cities", id },
        { type: "Cities", id: "LIST" },
      ],
    }),

    deleteCity: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.CITIES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Cities", id },
        { type: "Cities", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCitiesQuery,
  useGetCityQuery,
  useAddCityMutation,
  useUpdateCityMutation,
  useDeleteCityMutation,
} = citiesApi;
