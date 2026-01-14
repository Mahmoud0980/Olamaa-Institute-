// src/store/services/schoolsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

const API = ""; // ✅ نفس أسلوبك

export const schoolsApi = createApi({
  reducerPath: "schoolsApi",
  ...baseApiConfig,
  tagTypes: ["Schools"],

  endpoints: (builder) => ({
    // ✅ GET /api/schools
    getSchools: builder.query({
      query: (params) => ({
        url: `${API}${ENDPOINTS.SCHOOLS}`,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Schools", id })),
              { type: "Schools", id: "LIST" },
            ]
          : [{ type: "Schools", id: "LIST" }],
    }),

    // ✅ GET /api/schools/:id
    getSchool: builder.query({
      query: (id) => ({
        url: `${API}${ENDPOINTS.SCHOOLS}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Schools", id }],
    }),

    // ✅ POST /api/schools
    addSchool: builder.mutation({
      query: (data) => ({
        url: `${API}${ENDPOINTS.SCHOOLS}`,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Schools", id: "LIST" }],
    }),

    // ✅ PUT /api/schools/:id
    updateSchool: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${API}${ENDPOINTS.SCHOOLS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, arg) => [
        { type: "Schools", id: arg?.id },
        { type: "Schools", id: "LIST" },
      ],
    }),

    // ✅ DELETE /api/schools/:id
    deleteSchool: builder.mutation({
      query: (arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        return {
          url: `${API}${ENDPOINTS.SCHOOLS}/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: (r, e, arg) => {
        const id = typeof arg === "object" ? arg.id : arg;
        return [
          { type: "Schools", id },
          { type: "Schools", id: "LIST" },
        ];
      },
    }),
  }),
});

export const {
  useGetSchoolsQuery,
  useGetSchoolQuery,
  useAddSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
} = schoolsApi;
