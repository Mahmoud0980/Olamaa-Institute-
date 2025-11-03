import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الباصات
export const fetchBuses = createAsyncThunk(
  "buses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/buses");
      return res.data.data; // حسب structure API
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الباصات"
      );
    }
  }
);

// إضافة باص جديد
export const addBus = createAsyncThunk(
  "buses/add",
  async (busData, { rejectWithValue }) => {
    try {
      const res = await api.post("/buses", busData);
      return res.data.data;
    } catch (err) {
      if (err.errors) {
        // أخطاء Zod
        return rejectWithValue(err.errors.map((e) => e.message).join(", "));
      }
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الباص"
      );
    }
  }
);

// جلب باص حسب ID
export const fetchBusById = createAsyncThunk(
  "buses/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/buses/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في جلب الباص");
    }
  }
);

// تحديث باص
export const updateBus = createAsyncThunk(
  "buses/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/buses/${id}`, data);
      return res.data.data;
    } catch (err) {
      if (err.errors) {
        return rejectWithValue(err.errors.map((e) => e.message).join(", "));
      }
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الباص"
      );
    }
  }
);

// حذف باص
export const deleteBus = createAsyncThunk(
  "buses/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/buses/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في حذف الباص");
    }
  }
);

// ============ Slice ============

const busSlice = createSlice({
  name: "buses",
  initialState: {
    list: [],
    current: null, // باص محدد
    status: "idle",
    error: null,
  },
  reducers: {
    toggleBusActive: (state, action) => {
      const bus = state.list.find((b) => b.id === action.payload);
      if (bus) bus.is_active = !bus.is_active;
    },
    setSelectedBusId: (state, action) => {
      state.selectedBusId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchBuses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBuses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchBuses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addBus.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchBusById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBusById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchBusById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateBus.fulfilled, (state, action) => {
        const index = state.list.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteBus.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleBusActive, setSelectedBusId } = busSlice.actions;
export default busSlice.reducer;
