import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الأجهزة
export const fetchDevices = createAsyncThunk(
  "devices/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/authorized-devices");
      return res.data.data; // حسب structure API
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الأجهزة"
      );
    }
  }
);

// إضافة جهاز جديد
export const addDevice = createAsyncThunk(
  "devices/add",
  async (deviceData, { rejectWithValue }) => {
    try {
      const res = await api.post("/authorized-devices", deviceData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الجهاز"
      );
    }
  }
);

// جلب جهاز حسب ID
export const fetchDeviceById = createAsyncThunk(
  "devices/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/authorized-devices/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الجهاز"
      );
    }
  }
);

// تحديث جهاز
export const updateDevice = createAsyncThunk(
  "devices/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/authorized-devices/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الجهاز"
      );
    }
  }
);

// حذف جهاز
export const deleteDevice = createAsyncThunk(
  "devices/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/authorized-devices/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الجهاز"
      );
    }
  }
);

// ============ Slice ============
const devicesSlice = createSlice({
  name: "devices",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    toggleDeviceActive: (state, action) => {
      const device = state.list.find((d) => d.id === action.payload);
      if (device) device.is_active = !device.is_active;
    },
    setSelectedDeviceId: (state, action) => {
      state.selectedDeviceId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchDevices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addDevice.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchDeviceById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDeviceById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchDeviceById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateDevice.fulfilled, (state, action) => {
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleDeviceActive, setSelectedDeviceId } = devicesSlice.actions;
export default devicesSlice.reducer;
