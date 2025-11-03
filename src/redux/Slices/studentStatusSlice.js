import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل حالات الطلاب
export const fetchStudentStatuses = createAsyncThunk(
  "studentStatus/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/student-statuses");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الحالات"
      );
    }
  }
);

// إضافة حالة جديدة
export const addStudentStatus = createAsyncThunk(
  "studentStatus/add",
  async (statusData, { rejectWithValue }) => {
    try {
      const res = await api.post("/student-statuses", statusData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الحالة"
      );
    }
  }
);

// جلب حالة حسب ID
export const fetchStudentStatusById = createAsyncThunk(
  "studentStatus/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/student-statuses/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الحالة"
      );
    }
  }
);

// تحديث حالة حسب ID
export const updateStudentStatus = createAsyncThunk(
  "studentStatus/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/student-statuses/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الحالة"
      );
    }
  }
);

// حذف حالة حسب ID
export const deleteStudentStatus = createAsyncThunk(
  "studentStatus/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/student-statuses/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الحالة"
      );
    }
  }
);

// ============ Slice ============
const studentStatusSlice = createSlice({
  name: "studentStatus",
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
      .addCase(fetchStudentStatuses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentStatuses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchStudentStatuses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addStudentStatus.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })

      // Fetch by ID
      .addCase(fetchStudentStatusById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentStatusById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchStudentStatusById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateStudentStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })

      // Delete
      .addCase(deleteStudentStatus.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default studentStatusSlice.reducer;
