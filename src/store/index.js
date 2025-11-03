"use client";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import branchReducer from "../redux/Slices/instituteBranchesSlice";
import busesReducer from "../redux/Slices/busesSlice";
import batchesReducer from "../redux/Slices/batchesSlice";
import academicBranchesReducer from "../redux/Slices/academicBranchesSlice";
import studentStatusReducer from "../redux/Slices/studentStatusSlice";
import createStudentsReducer from "../redux/Slices/createStudentsSlice";
import citiesReducer from "../redux/Slices/citiesSlice";
import usersReducer from "../redux/Slices/usersSlice";
import studentReducer from "../redux/Slices/studentsSlice";

const store = configureStore({
  reducer: {
    branches: branchReducer,
    buses: busesReducer,
    batches: batchesReducer,
    academicBranches: academicBranchesReducer,
    studentStatus: studentStatusReducer,
    createStudents: createStudentsReducer,
    cities: citiesReducer,
    users: usersReducer,
    students: studentReducer,
  },
});

export function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}

export default store;
