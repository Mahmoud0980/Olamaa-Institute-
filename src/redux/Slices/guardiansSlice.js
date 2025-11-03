import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل أولياء الأمور
export const fetchGuardians = createAsyncThunk(
  "guardians/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/guardians");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب أولياء الأمور"
      );
    }
  }
);

// إضافة ولي أمر
export const addGuardian = createAsyncThunk(
  "guardians/add",
  async (guardianData, { rejectWithValue }) => {
    try {
      const res = await api.post("/guardians", guardianData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة ولي الأمر"
      );
    }
  }
);

// جلب ولي أمر حسب ID
export const fetchGuardianById = createAsyncThunk(
  "guardians/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/guardians/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب ولي الأمر"
      );
    }
  }
);

// تحديث ولي أمر
export const updateGuardian = createAsyncThunk(
  "guardians/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/guardians/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث ولي الأمر"
      );
    }
  }
);

// حذف ولي أمر
export const deleteGuardian = createAsyncThunk(
  "guardians/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/guardians/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف ولي الأمر"
      );
    }
  }
);

// ============ Slice ============

const guardiansSlice = createSlice({
  name: "guardians",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchGuardians.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGuardians.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchGuardians.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addGuardian.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch By ID
      .addCase(fetchGuardianById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGuardianById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchGuardianById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateGuardian.fulfilled, (state, action) => {
        const index = state.list.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteGuardian.fulfilled, (state, action) => {
        state.list = state.list.filter((g) => g.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default guardiansSlice.reducer;
