import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const guardiansApi = createApi({
  reducerPath: "guardiansApi",
  ...baseApiConfig,
  tagTypes: ["Guardians"],

  endpoints: (builder) => ({
    getGuardian: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.GUARDIANS}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Guardians", id }],
    }),

    updateGuardian: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.GUARDIANS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [{ type: "Guardians", id }],
    }),
  }),
});

export const { useGetGuardianQuery, useUpdateGuardianMutation } = guardiansApi;
