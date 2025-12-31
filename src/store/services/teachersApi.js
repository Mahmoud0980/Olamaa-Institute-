import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";
import ENDPOINTS from "@/lib/constants/endpoints";

export const teachersApi = createApi({
  reducerPath: "teachersApi",
  ...baseApiConfig,
  // ✅ FIX
  tagTypes: ["Teachers", "TeacherDetails"],

  endpoints: (builder) => ({
    // ========================
    // GET ALL TEACHERS
    // ========================
    getTeachers: builder.query({
      query: (params) => ({
        url: ENDPOINTS.TEACHERS,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Teachers", id })),
              { type: "Teachers", id: "LIST" },
            ]
          : [{ type: "Teachers", id: "LIST" }],
    }),

    // ========================
    // GET SINGLE TEACHER
    // ========================
    getTeacher: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.TEACHERS}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Teachers", id }],
    }),

    // ========================
    // ADD TEACHER
    // ========================
    addTeacher: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.TEACHERS,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Teachers", id: "LIST" }],
    }),

    // ========================
    // UPDATE TEACHER
    // ========================
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.TEACHERS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Teachers", id },
        { type: "Teachers", id: "LIST" },
      ],
    }),

    // ========================
    // DELETE TEACHER
    // ========================
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.TEACHERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Teachers", id },
        { type: "Teachers", id: "LIST" },
      ],
    }),

    // ========================
    // UPLOAD TEACHER PHOTO
    // ========================
    uploadTeacherPhoto: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("photo", file);

        return {
          url: `/teachers/${id}/photo`,
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
      invalidatesTags: (r, e, { id }) => [
        { type: "Teachers", id },
        { type: "Teachers", id: "LIST" },
      ],
    }),

    // ========================
    // GET TEACHER BATCHES DETAILS
    // ========================
    getTeacherBatchesDetails: builder.query({
      query: ({ id, type = "all" }) => ({
        url: `/teachers/${id}/batches-details`,
        method: "GET",
        params: { type },
      }),
      providesTags: (r, e, arg) => [
        { type: "TeacherDetails", id: `TEACHER-${arg?.id}` },
      ],
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useAddTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useUploadTeacherPhotoMutation,
  useGetTeacherBatchesDetailsQuery,
  useLazyGetTeacherBatchesDetailsQuery,
} = teachersApi;
