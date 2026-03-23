import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const contactsApi = createApi({
  reducerPath: "contactsApi",
  ...baseApiConfig,
  tagTypes: ["Contacts"],

  endpoints: (builder) => ({
    getContacts: builder.query({
      query: (params) => ({
        url: ENDPOINTS.CONTACTS,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
            ...(Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.data) ? r.data.data : []).map(({ id }) => ({ type: "Contacts", id })),
            { type: "Contacts", id: "LIST" },
          ]
          : [{ type: "Contacts", id: "LIST" }],
    }),

    getContact: builder.query({
      query: (id) => ({ url: `${ENDPOINTS.CONTACTS}/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "Contacts", id }],
    }),

    getStudentContactsSummary: builder.query({
      query: (student_id) => ({
        url: `${ENDPOINTS.STUDENT_SUMMARY}/${student_id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Contacts", id: `STUDENT_SUMMARY_${id}` }],
    }),

    addContact: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.CONTACTS,
        method: "POST",
        data,
      }),
      invalidatesTags: (r) => [
        { type: "Contacts", id: "LIST" },
        ...(r?.data?.id ? [{ type: "Contacts", id: r.data.id }] : []),
      ],
    }),

    updateContact: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.CONTACTS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Contacts", id },
        { type: "Contacts", id: "LIST" },
      ],
    }),

    deleteContact: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.CONTACTS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Contacts", id },
        { type: "Contacts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactQuery,
  useGetStudentContactsSummaryQuery,
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactsApi;
