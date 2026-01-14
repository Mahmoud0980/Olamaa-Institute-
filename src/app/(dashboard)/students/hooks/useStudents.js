"use client";

import { useGetStudentsQuery } from "@/store/services/studentsApi";

export default function useStudents(params) {
  const { data, isLoading, isFetching, refetch } = useGetStudentsQuery(params);

  // data هنا (حسب transformResponse) غالباً تكون array
  const students = Array.isArray(data) ? data : data?.data || [];

  return { students, isLoading: isLoading || isFetching, refetch };
}
