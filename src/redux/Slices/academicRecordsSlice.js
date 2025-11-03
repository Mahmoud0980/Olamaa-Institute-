// features/records/recordsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get all records
export const fetchRecords = createAsyncThunk("records/fetchAll", async () => {
  const res = await axios.get("/api/academic-records");
  return res.data;
});

// Get records by student
// export const fetchRecordsByStudent = createAsyncThunk(
//   "records/fetchByStudent",
//   async (studentId) => {
//     const res = await axios.get(`/api/students/${studentId}/records`);
//     return res.data;
//   }
// );

// Get one record
export const fetchRecordById = createAsyncThunk(
  "records/fetchById",
  async (id) => {
    const res = await axios.get(`/api/academic-records/${id}`);
    return res.data;
  }
);

// Add new record
export const addRecord = createAsyncThunk("records/add", async (newRecord) => {
  const res = await axios.post("/api/academic-records", newRecord);
  return res.data;
});

// Update record
export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ id, updatedData }) => {
    const res = await axios.put(`/api/academic-records/${id}`, updatedData);
    return res.data;
  }
);

// Delete record
export const deleteRecord = createAsyncThunk("records/delete", async (id) => {
  await axios.delete(`/api/academic-records/${id}`);
  return id;
});

// =======================
// Slice
// =======================
const recordsSlice = createSlice({
  name: "records",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchRecords.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // fetch by student
      .addCase(fetchRecordsByStudent.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })

      // fetch by id
      .addCase(fetchRecordById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })

      // add
      .addCase(addRecord.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // update
      .addCase(updateRecord.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })

      // delete
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default recordsSlice.reducer;
