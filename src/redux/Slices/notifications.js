import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الإشعارات
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/notifications");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الإشعارات"
      );
    }
  }
);

// إضافة إشعار جديد
export const addNotification = createAsyncThunk(
  "notifications/add",
  async (notificationData, { rejectWithValue }) => {
    try {
      const res = await api.post("/notifications", notificationData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الإشعار"
      );
    }
  }
);

// جلب إشعار حسب ID
export const fetchNotificationById = createAsyncThunk(
  "notifications/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/notifications/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الإشعار"
      );
    }
  }
);

// تحديث إشعار حسب ID
export const updateNotification = createAsyncThunk(
  "notifications/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/notifications/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الإشعار"
      );
    }
  }
);

// حذف إشعار حسب ID
export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الإشعار"
      );
    }
  }
);

// ============ Slice ============
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: [],
    current: null, // إشعار محدد عند fetch by ID
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addNotification.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchNotificationById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotificationById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchNotificationById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateNotification.fulfilled, (state, action) => {
        const index = state.list.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.list = state.list.filter((n) => n.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default notificationSlice.reducer;
