import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";

export const batcheSubjectsApi = createApi({
  reducerPath: "batcheSubjectsApi",
  ...baseApiConfig,
  tagTypes: ["BatchSubjects"],

  endpoints: (builder) => ({
    // ========================
    // GET SUBJECTS BY BATCH
    // ========================
    getBatchSubjects: builder.query({
      query: (batchId) => ({
        url: `/batcheSubjects/${batchId}/subjects`,
        method: "GET",
      }),
      providesTags: (r, e, batchId) => [
        { type: "BatchSubjects", id: `BATCH-${batchId}` },
      ],
    }),

    // ========================
    // ASSIGN INSTRUCTOR SUBJECT TO BATCH
    // ========================
    assignInstructorSubjectToBatch: builder.mutation({
      query: ({ batch_id, instructor_subject_id, notes }) => ({
        url: `/batcheSubjects/assign-instructor-subject`,
        method: "POST",
        data: { batch_id, instructor_subject_id, notes },
      }),
      invalidatesTags: (r, e, { batch_id }) => [
        { type: "BatchSubjects", id: `BATCH-${batch_id}` },
      ],
    }),

    // ========================
    // REMOVE INSTRUCTOR SUBJECT FROM BATCH
    // ========================
    removeInstructorSubjectFromBatch: builder.mutation({
      query: ({ batch_id, instructor_subject_id }) => ({
        url: `/batcheSubjects/remove-instructor-subject`,
        method: "POST",
        data: { batch_id, instructor_subject_id },
      }),
      invalidatesTags: (r, e, { batch_id }) => [
        { type: "BatchSubjects", id: `BATCH-${batch_id}` },
      ],
    }),

    // ========================
    // UPDATE BATCH SUBJECT
    // ========================
    updateBatchSubject: builder.mutation({
      query: ({ id, instructor_subject_id, notes }) => ({
        url: `/batcheSubjects/update-batch-subject/${id}`,
        method: "PUT",
        data: { instructor_subject_id, notes },
      }),
      invalidatesTags: [{ type: "BatchSubjects", id: "LIST" }],
    }),

    // ========================
    // DELETE BATCH SUBJECT
    // ========================
    deleteBatchSubject: builder.mutation({
      query: (id) => ({
        url: `/batcheSubjects/delete-batch-subject/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "BatchSubjects", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBatchSubjectsQuery,
  useAssignInstructorSubjectToBatchMutation,
  useRemoveInstructorSubjectFromBatchMutation,
  useUpdateBatchSubjectMutation,
  useDeleteBatchSubjectMutation,
} = batcheSubjectsApi;
