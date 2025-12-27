import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    values: {
      employees: "",
      students: "",
      batches: "",
      academicBranches: "",
      InstituteBranches: "",
      cities: "",
      buses: "",
      knowWays: "",
      classRooms: "",
      branch: "",
    },
  },
  reducers: {
    setSearchValue: (state, action) => {
      const { key, value } = action.payload;
      state.values[key] = value;
    },

    clearSearchValue: (state, action) => {
      const key = action.payload;
      state.values[key] = "";
    },
  },
});

export const { setSearchValue, clearSearchValue } = searchSlice.actions;
export default searchSlice.reducer;
