import { useStudentDetailsByIdQuery } from "@/store/services/studentDetailsApi";

export default function useStudentData(studentId) {
  const numericId = Number(studentId);

  const {
    data: student,
    isLoading,
    isFetching,
    error,
  } = useStudentDetailsByIdQuery(numericId, {
    skip: !numericId,
  });

  return {
    student,
    loading: isLoading || isFetching,
    error,
  };
}
