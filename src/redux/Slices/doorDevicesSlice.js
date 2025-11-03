import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل أجهزة الأبواب
export const fetchDoorDevices = createAsyncThunk(
  "doorDevices/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/door-devices");
      return res.data.data; // حسب structure API
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الأجهزة"
      );
    }
  }
);

// إضافة جهاز جديد
export const addDoorDevice = createAsyncThunk(
  "doorDevices/add",
  async (deviceData, { rejectWithValue }) => {
    try {
      const res = await api.post("/door-devices", deviceData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الجهاز"
      );
    }
  }
);

// جلب جهاز حسب ID
export const fetchDoorDeviceById = createAsyncThunk(
  "doorDevices/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/door-devices/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الجهاز"
      );
    }
  }
);

// تحديث جهاز حسب ID
export const updateDoorDevice = createAsyncThunk(
  "doorDevices/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/door-devices/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الجهاز"
      );
    }
  }
);

// حذف جهاز حسب ID
export const deleteDoorDevice = createAsyncThunk(
  "doorDevices/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/door-devices/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الجهاز"
      );
    }
  }
);

// ============ Slice ============

const doorDevicesSlice = createSlice({
  name: "doorDevices",
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
      .addCase(fetchDoorDevices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoorDevices.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDoorDevices.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addDoorDevice.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchDoorDeviceById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoorDeviceById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchDoorDeviceById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateDoorDevice.fulfilled, (state, action) => {
        const index = state.list.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteDoorDevice.fulfilled, (state, action) => {
        state.list = state.list.filter((d) => d.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleDeviceActive, setSelectedDeviceId } =
  doorDevicesSlice.actions;
export default doorDevicesSlice.reducer;
