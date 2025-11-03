import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الأقساط
export const fetchInstallments = createAsyncThunk(
  "installments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/installments");
      return res.data.data; // حسب response API
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الأقساط"
      );
    }
  }
);

// إضافة قسط جديد
export const addInstallment = createAsyncThunk(
  "installments/add",
  async (installmentData, { rejectWithValue }) => {
    try {
      const res = await api.post("/installments", installmentData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة القسط"
      );
    }
  }
);

// جلب قسط حسب ID
export const fetchInstallmentById = createAsyncThunk(
  "installments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/installments/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في جلب القسط");
    }
  }
);

// تحديث قسط حسب ID
export const updateInstallment = createAsyncThunk(
  "installments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/installments/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث القسط"
      );
    }
  }
);

// حذف قسط حسب ID
export const deleteInstallment = createAsyncThunk(
  "installments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/installments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في حذف القسط");
    }
  }
);

// ============ Slice ============

const installmentSlice = createSlice({
  name: "installments",
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
      .addCase(fetchInstallments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstallments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchInstallments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addInstallment.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchInstallmentById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchInstallmentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchInstallmentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateInstallment.fulfilled, (state, action) => {
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteInstallment.fulfilled, (state, action) => {
        state.list = state.list.filter((i) => i.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default installmentSlice.reducer;
