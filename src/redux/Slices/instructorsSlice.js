import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل المدربين
export const fetchInstructors = createAsyncThunk(
  "instructors/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/trainers"); // API endpoint ممكن يبقى instructors لو عندك
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المدربين"
      );
    }
  }
);

// إضافة مدرب جديد
export const addInstructor = createAsyncThunk(
  "instructors/add",
  async (instructorData, { rejectWithValue }) => {
    try {
      const res = await api.post("/trainers", instructorData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة المدرب"
      );
    }
  }
);

// جلب مدرب حسب ID
export const fetchInstructorById = createAsyncThunk(
  "instructors/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/trainers/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المدرب"
      );
    }
  }
);

// تحديث مدرب حسب ID
export const updateInstructor = createAsyncThunk(
  "instructors/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/trainers/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث المدرب"
      );
    }
  }
);

// حذف مدرب حسب ID
export const deleteInstructor = createAsyncThunk(
  "instructors/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/trainers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف المدرب"
      );
    }
  }
);

// ============ Slice ============

const instructorsSlice = createSlice({
  name: "instructors",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchInstructors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addInstructor.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchInstructorById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstructorById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchInstructorById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateInstructor.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteInstructor.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default instructorsSlice.reducer;
