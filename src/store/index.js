import { configureStore } from "@reduxjs/toolkit";

// ====== APIs ======
import { studentsApi } from "./services/studentsApi";
import { batchesApi } from "./services/batchesApi";
import { enrollmentsApi } from "./services/enrollmentsApi";
import { instituteBranchesApi } from "./services/instituteBranchesApi";
import { academicBranchesApi } from "./services/academicBranchesApi";
import { busesApi } from "./services/busesApi";
import { citiesApi } from "./services/citiesApi";
import { studentStatusesApi } from "./services/studentStatusesApi";
import { academicRecordsApi } from "./services/academicRecordsApi";
import { contactsApi } from "./services/contactsApi";
import { subjectsApi } from "./services/subjectsApi";
import { employeesApi } from "./services/employeesApi";
import { studentDetailsApi } from "./services/studentDetailsApi";
import { studentAttendanceApi } from "./services/studentAttendanceApi";
import { knowWaysApi } from "./services/knowWaysApi";
import searchReducer from "./slices/searchSlice";
import { classRoomsApi } from "./services/classRoomsApi";
import { studentPaymentsApi } from "./services/studentPaymentsApi";
import { qrApi } from "./services/qrApi";
import { batcheSubjectsApi } from "./services/batcheSubjectsApi";
import { teachersApi } from "./services/teachersApi";
import { subjectsTeachersApi } from "./services/subjectsTeachersApi";
import { statisticsApi } from "./services/statisticsApi";
import { attendanceApi } from "./services/attendanceApi";
import { schoolsApi } from "./services/schoolsApi";
import { paymentsApi } from "./services/paymentsApi";
import { guardiansApi } from "./services/guardiansApi";
import { enrollmentContractsApi } from "./services/enrollmentContractsApi";
import { batchStudentsApi } from "./services/batchStudentsApi";

export const store = configureStore({
  reducer: {
    [studentsApi.reducerPath]: studentsApi.reducer,
    [batchesApi.reducerPath]: batchesApi.reducer,
    [enrollmentsApi.reducerPath]: enrollmentsApi.reducer,
    [instituteBranchesApi.reducerPath]: instituteBranchesApi.reducer,
    [academicBranchesApi.reducerPath]: academicBranchesApi.reducer,
    [busesApi.reducerPath]: busesApi.reducer,
    [citiesApi.reducerPath]: citiesApi.reducer,
    [studentStatusesApi.reducerPath]: studentStatusesApi.reducer,
    [academicRecordsApi.reducerPath]: academicRecordsApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [employeesApi.reducerPath]: employeesApi.reducer,
    [studentDetailsApi.reducerPath]: studentDetailsApi.reducer,
    [studentAttendanceApi.reducerPath]: studentAttendanceApi.reducer,
    [subjectsApi.reducerPath]: subjectsApi.reducer,
    [knowWaysApi.reducerPath]: knowWaysApi.reducer,
    [classRoomsApi.reducerPath]: classRoomsApi.reducer,
    [studentPaymentsApi.reducerPath]: studentPaymentsApi.reducer,
    [qrApi.reducerPath]: qrApi.reducer,
    [batcheSubjectsApi.reducerPath]: batcheSubjectsApi.reducer,
    [teachersApi.reducerPath]: teachersApi.reducer,
    [subjectsTeachersApi.reducerPath]: subjectsTeachersApi.reducer,
    [statisticsApi.reducerPath]: statisticsApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [schoolsApi.reducerPath]: schoolsApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
    [guardiansApi.reducerPath]: guardiansApi.reducer,
    [enrollmentContractsApi.reducerPath]: enrollmentContractsApi.reducer,
    [batchStudentsApi.reducerPath]: batchStudentsApi.reducer,
    search: searchReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(studentsApi.middleware)
      .concat(batchesApi.middleware)
      .concat(enrollmentsApi.middleware)
      .concat(instituteBranchesApi.middleware)
      .concat(academicBranchesApi.middleware)
      .concat(busesApi.middleware)
      .concat(citiesApi.middleware)
      .concat(studentStatusesApi.middleware)
      .concat(academicRecordsApi.middleware)
      .concat(contactsApi.middleware)
      .concat(employeesApi.middleware)
      .concat(studentDetailsApi.middleware)
      .concat(studentAttendanceApi.middleware)
      .concat(subjectsApi.middleware)
      .concat(knowWaysApi.middleware)
      .concat(classRoomsApi.middleware)
      .concat(studentPaymentsApi.middleware)
      .concat(qrApi.middleware)
      .concat(batcheSubjectsApi.middleware)
      .concat(teachersApi.middleware)
      .concat(subjectsTeachersApi.middleware)
      .concat(statisticsApi.middleware)
      .concat(attendanceApi.middleware)
      .concat(schoolsApi.middleware)
      .concat(paymentsApi.middleware)
      .concat(guardiansApi.middleware)
      .concat(enrollmentContractsApi.middleware)
      .concat(batchStudentsApi.middleware),
});
