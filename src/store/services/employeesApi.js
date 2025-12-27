import { createApi } from "@reduxjs/toolkit/query/react";
import ENDPOINTS from "@/lib/constants/endpoints";
import { baseApiConfig } from "./baseApi";

export const employeesApi = createApi({
  reducerPath: "employeesApi",
  ...baseApiConfig,
  tagTypes: ["Employees"],

  endpoints: (builder) => ({
    getEmployees: builder.query({
      query: (params) => ({
        url: ENDPOINTS.EMPLOYEES,
        method: "GET",
        params,
      }),
      providesTags: (r) =>
        r?.data
          ? [
              ...r.data.map(({ id }) => ({ type: "Employees", id })),
              { type: "Employees", id: "LIST" },
            ]
          : [{ type: "Employees", id: "LIST" }],
    }),

    getEmployee: builder.query({
      query: (id) => ({
        url: `${ENDPOINTS.EMPLOYEES}/${id}`,
        method: "GET",
      }),
      providesTags: (r, e, id) => [{ type: "Employees", id }],
    }),

    addEmployee: builder.mutation({
      query: (data) => ({
        url: ENDPOINTS.EMPLOYEES,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }],
    }),

    updateEmployee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${ENDPOINTS.EMPLOYEES}/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Employees", id },
        { type: "Employees", id: "LIST" },
      ],
    }),
    uploadEmployeePhoto: builder.mutation({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("photo", file);

        return {
          url: `/employees/${id}/photo`,
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };
      },
      invalidatesTags: (r, e, { id }) => [
        { type: "Employees", id },
        { type: "Employees", id: "LIST" },
      ],
    }),

    assignEmployeeToBatch: builder.mutation({
      query: ({ id, batch_id }) => ({
        url: `/employees/${id}/assign-to-batch`,
        method: "POST",
        data: { batch_id },
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: "Employees", id },
        { type: "Employees", id: "LIST" },
      ],
    }),

    removeEmployeeAssignment: builder.mutation({
      query: ({ employeeId, batchId }) => ({
        url: `/employees/${employeeId}/assignments/${batchId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Employees", id: "LIST" }],
    }),

    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `${ENDPOINTS.EMPLOYEES}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, id) => [
        { type: "Employees", id },
        { type: "Employees", id: "LIST" },
      ],
    }),

    getEmployeesWithBatches: builder.query({
      query: () => ({
        url: "/employees/with-assignments",
        method: "GET",
      }),
      providesTags: [{ type: "Employees", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeesWithBatchesQuery,
  useAssignEmployeeToBatchMutation,
  useUploadEmployeePhotoMutation,
  useRemoveEmployeeAssignmentMutation,
} = employeesApi;
