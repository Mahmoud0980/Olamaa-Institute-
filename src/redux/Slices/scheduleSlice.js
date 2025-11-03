import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ================= Async Thunks =================

// جلب كل الجداول
export const fetchSchedules = createAsyncThunk(
  "schedules/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/lesson-schedules");
      return res.data.data; // حسب API: data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الجداول"
      );
    }
  }
);

// إضافة جدول جديد
export const addSchedule = createAsyncThunk(
  "schedules/add",
  async (scheduleData, { rejectWithValue }) => {
    try {
      const res = await api.post("/lesson-schedules", scheduleData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الجدول"
      );
    }
  }
);

// جلب جدول حسب ID
export const fetchScheduleById = createAsyncThunk(
  "schedules/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/lesson-schedules/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الجدول"
      );
    }
  }
);

// تحديث جدول
export const updateSchedule = createAsyncThunk(
  "schedules/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/lesson-schedules/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الجدول"
      );
    }
  }
);

// حذف جدول
export const deleteSchedule = createAsyncThunk(
  "schedules/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/lesson-schedules/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الجدول"
      );
    }
  }
);

// ================= Slice =================
const scheduleSlice = createSlice({
  name: "schedules",
  initialState: {
    list: [],
    current: null, // جدول واحد عند fetchById
    status: "idle",
    error: null,
  },
  reducers: {
    toggleScheduleActive: (state, action) => {
      const schedule = state.list.find((s) => s.id === action.payload);
      if (schedule) schedule.is_active = !schedule.is_active;
    },
    setSelectedScheduleId: (state, action) => {
      state.selectedScheduleId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchSchedules.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addSchedule.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchScheduleById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchScheduleById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchScheduleById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateSchedule.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleScheduleActive, setSelectedScheduleId } =
  scheduleSlice.actions;

export default scheduleSlice.reducer;
