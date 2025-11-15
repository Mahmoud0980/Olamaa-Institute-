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
      .concat(contactsApi.middleware),
});
