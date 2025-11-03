import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============ //

// جلب جميع سجلات الحضور
export const fetchAttendances = createAsyncThunk(
  "attendances/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/attendances");
      return res.data.data; // حسب structure API
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب سجلات الحضور"
      );
    }
  }
);

// إضافة سجل حضور جديد
export const addAttendance = createAsyncThunk(
  "attendances/add",
  async (attendanceData, { rejectWithValue }) => {
    try {
      const res = await api.post("/attendances", attendanceData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة سجل الحضور"
      );
    }
  }
);

// جلب سجل حضور حسب ID
export const fetchAttendanceById = createAsyncThunk(
  "attendances/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/attendances/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب سجل الحضور"
      );
    }
  }
);

// تحديث سجل حضور
export const updateAttendance = createAsyncThunk(
  "attendances/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/attendances/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث سجل الحضور"
      );
    }
  }
);

// حذف سجل حضور
export const deleteAttendance = createAsyncThunk(
  "attendances/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/attendances/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف سجل الحضور"
      );
    }
  }
);

// ============ Slice ============ //
const attendanceSlice = createSlice({
  name: "attendances",
  initialState: {
    list: [],
    current: null, // سجل محدد
    status: "idle",
    error: null,
  },
  reducers: {
    // مثال: قلب حالة الحضور (اختياري)
    toggleAttendanceStatus: (state, action) => {
      const record = state.list.find((r) => r.id === action.payload);
      if (record) {
        record.status = record.status === "present" ? "absent" : "present";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAttendances.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttendances.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchAttendances.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addAttendance.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchAttendanceById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttendanceById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchAttendanceById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateAttendance.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleAttendanceStatus } = attendanceSlice.actions;
export default attendanceSlice.reducer;
