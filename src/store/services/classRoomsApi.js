import { createApi } from "@reduxjs/toolkit/query/react";
import { baseApiConfig } from "./baseApi";
import ENDPOINTS from "@/lib/constants/endpoints";

export const classRoomsApi = createApi({
  reducerPath: "classRoomsApi",
  ...baseApiConfig,
  tagTypes: ["ClassRooms"],

  endpoints: (builder) => ({
    getClassRooms: builder.query({
      query: () => ({
        url: ENDPOINTS.CLASS_ROOMS,
        method: "GET",
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({
                type: "ClassRooms",
                id,
              })),
              { type: "ClassRooms", id: "LIST" },
            ]
          : [{ type: "ClassRooms", id: "LIST" }],
    }),

    addClassRoom: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.CLASS_ROOMS,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "ClassRooms", id: "LIST" }],
    }),

    updateClassRoom: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.CLASS_ROOMS}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "ClassRooms", id },
        { type: "ClassRooms", id: "LIST" },
      ],
    }),

    deleteClassRoom: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.CLASS_ROOMS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "ClassRooms", id },
        { type: "ClassRooms", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetClassRoomsQuery,
  useAddClassRoomMutation,
  useUpdateClassRoomMutation,
  useDeleteClassRoomMutation,
} = classRoomsApi;
