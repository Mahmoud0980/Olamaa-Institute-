import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const subjectsTeachersApi = createApi({
  reducerPath: "subjectsTeachersApi",
  ...baseApiConfig,
  tagTypes: ["SubjectTeachers"],

  endpoints: (builder) => ({
    // ========================
    // GET TEACHERS BY SUBJECT
    // ========================
    getTeachersBySubject: builder.query({
      query: (subjectId) => ({
        url: `/subjects/${subjectId}/teachers`,
        method: "GET",
      }),
      providesTags: (r, e, subjectId) => [
        { type: "SubjectTeachers", id: `SUBJECT-${subjectId}` },
      ],
    }),

    // ========================
    // ASSIGN TEACHER TO SUBJECT
    // ========================
    assignTeacherToSubject: builder.mutation({
      query: ({ subject_id, instructor_id }) => ({
        url: `/subjects/assign-teacher`,
        method: "POST",
        data: { subject_id, instructor_id },
      }),
      invalidatesTags: (r, e, { subject_id }) => [
        { type: "SubjectTeachers", id: `SUBJECT-${subject_id}` },
      ],
    }),

    // ========================
    // UPDATE TEACHER SUBJECT
    // ========================
    updateTeacherSubject: builder.mutation({
      query: ({ id, subject_id, instructor_id }) => ({
        url: `/subjects/update-teacher-subject/${id}`,
        method: "PUT",
        data: { subject_id, instructor_id },
      }),
      invalidatesTags: [{ type: "SubjectTeachers", id: "LIST" }],
    }),

    // ========================
    // DELETE TEACHER SUBJECT
    // ========================
    deleteTeacherSubject: builder.mutation({
      query: (id) => ({
        url: `/subjects/delete-teacher-subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SubjectTeachers", id: "LIST" }],
    }),
    deleteTeacherSubjectByIds: builder.mutation({
      query: ({ instructor_id, subject_id }) => ({
        url: `/subjects/delete-teacher-subject-by-ids`,
        method: "DELETE",
        data: { instructor_id, subject_id }, // ✅ DELETE مع body مدعوم
      }),
      invalidatesTags: [{ type: "SubjectTeachers", id: "LIST" }],
    }),
  }),
});

export const {
  useGetTeachersBySubjectQuery,
  useAssignTeacherToSubjectMutation,
  useUpdateTeacherSubjectMutation,
  useDeleteTeacherSubjectMutation,
  useDeleteTeacherSubjectByIdsMutation,
} = subjectsTeachersApi;
