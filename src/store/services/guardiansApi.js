import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const guardiansApi = createApi({
  reducerPath: "guardiansApi",
  ...baseApiConfig,
  tagTypes: ["Guardians"],

  endpoints: (builder) => ({
    // GET /api/guardians
    getGuardians: builder.query({
      query: (params) => ({
        url: ENDPOINTS.GUARDIANS,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
            ...r.data.map(({ id }) => ({ type: "Guardians", id })),
            { type: "Guardians", id: "LIST" },
          ]
          : [{ type: "Guardians", id: "LIST" }],
    }),

    // GET /api/guardians/:id
    getGuardian: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.GUARDIANS}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Guardians", id }],
    }),

    // POST /api/guardians
    addGuardian: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.GUARDIANS,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Guardians", id: "LIST" }],
    }),

    // PUT /api/guardians/:id
    updateGuardian: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.GUARDIANS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Guardians", id: arg?.id },
        { type: "Guardians", id: "LIST" },
      ],
    }),

    // DELETE /api/guardians/:id
    deleteGuardian: builder.mutation({
      query: (arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        return {
          url: `${ENDPOINTS.GUARDIANS}/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (r, e, arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        return [
          { type: "Guardians", id },
          { type: "Guardians", id: "LIST" },
        ];
      },
    }),

    // GET /api/guardians/total-guardians
    getTotalGuardians: builder.query({
      query: () => ({
        url: `${ENDPOINTS.GUARDIANS}/total-guardians`,
        method: "GET",
      }),
      providesTags: [{ type: "Guardians", id: "TOTAL" }],
    }),
  }),
});

export const {
  useGetGuardiansQuery,
  useGetGuardianQuery,
  useAddGuardianMutation,
  useUpdateGuardianMutation,
  useDeleteGuardianMutation,
  useGetTotalGuardiansQuery,
} = guardiansApi;
