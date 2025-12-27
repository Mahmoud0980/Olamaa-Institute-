import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const subjectsApi = createApi({
  reducerPath: "subjectsApi",
  baseQuery: baseApiConfig.baseQuery,
  tagTypes: ["Subjects"],

  keepUnusedDataFor: 300, // الكاش يبقى دقيقتين
  refetchOnFocus: true, // يحدث عند رجوع المستخدم للصفحة
  refetchOnReconnect: true, // يحدث عند عودة الإنترنت

  endpoints: (builder) => ({
    getSubjects: builder.query({
      query: () => ({
        url: ENDPOINTS.SUBJECTS,
        method: "GET",
      }),
      transformResponse: (res) => res.data ?? res,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Subjects", id })),
              { type: "Subjects", id: "LIST" },
            ]
          : [{ type: "Subjects", id: "LIST" }],
    }),

    addSubject: builder.mutation({
      query: (body) => ({
        url: ENDPOINTS.SUBJECTS,
        method: "POST",
        data: body,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            subjectsApi.util.updateQueryData(
              "getSubjects",
              undefined,
              (draft) => {
                draft.push(data);
              }
            )
          );
        } catch {}
      },
      invalidatesTags: [{ type: "Subjects", id: "LIST" }],
    }),

    updateSubject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `${ENDPOINTS.SUBJECTS}/${id}`,
        method: "PUT",
        data: body,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const update = dispatch(
          subjectsApi.util.updateQueryData(
            "getSubjects",
            undefined,
            (draft) => {
              const index = draft.findIndex((s) => s.id === id);
              if (index !== -1) Object.assign(draft[index], patch);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          update.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "Subjects", id: arg.id },
      ],
    }),

    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.SUBJECTS}/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const update = dispatch(
          subjectsApi.util.updateQueryData(
            "getSubjects",
            undefined,
            (draft) => {
              const index = draft.findIndex((s) => s.id === id);
              if (index !== -1) draft.splice(index, 1);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          update.undo();
        }
      },
      invalidatesTags: (result, error, id) => [
        { type: "Subjects", id },
        { type: "Subjects", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useAddSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi;
