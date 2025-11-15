import { useGetStudentsQuery } from "@/store/services/studentsApi";

export default function useStudents(params) {
  const { data, isLoading, isFetching, error } = useGetStudentsQuery(params);

  const students = Array.isArray(data?.data) ? data.data : data || [];

  return {
    students,
    isLoading,
    isFetching,
    error,
  };
}
