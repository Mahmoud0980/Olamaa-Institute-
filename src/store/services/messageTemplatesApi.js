import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const messageTemplatesApi = createApi({
  reducerPath: "messageTemplatesApi",
  ...baseApiConfig,
  tagTypes: ["MessageTemplates"],

  endpoints: (builder) => ({
    getMessageTemplates: builder.query({
      query: (params) => ({
        url: ENDPOINTS.MESSAGE_TEMPLATES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "MessageTemplates", id })),
              { type: "MessageTemplates", id: "LIST" },
            ]
          : [{ type: "MessageTemplates", id: "LIST" }],
    }),

    getMessageTemplate: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.MESSAGE_TEMPLATES}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "MessageTemplates", id }],
    }),

    addMessageTemplate: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.MESSAGE_TEMPLATES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "MessageTemplates", id: "LIST" }],
    }),

    updateMessageTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.MESSAGE_TEMPLATES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "MessageTemplates", id },
        { type: "MessageTemplates", id: "LIST" },
      ],
    }),

    deleteMessageTemplate: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.MESSAGE_TEMPLATES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "MessageTemplates", id },
        { type: "MessageTemplates", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetMessageTemplatesQuery,
  useGetMessageTemplateQuery,
  useAddMessageTemplateMutation,
  useUpdateMessageTemplateMutation,
  useDeleteMessageTemplateMutation,
} = messageTemplatesApi;
