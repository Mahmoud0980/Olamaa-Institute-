import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل المدفوعات
export const fetchPayments = createAsyncThunk(
  "payments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/payments");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المدفوعات"
      );
    }
  }
);

// إضافة دفعة جديدة
export const addPayment = createAsyncThunk(
  "payments/add",
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await api.post("/payments", paymentData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الدفع"
      );
    }
  }
);

// جلب دفعة حسب ID
export const fetchPaymentById = createAsyncThunk(
  "payments/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/payments/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في جلب الدفع");
    }
  }
);

// تحديث دفعة حسب ID
export const updatePayment = createAsyncThunk(
  "payments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/payments/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الدفع"
      );
    }
  }
);

// حذف دفعة حسب ID
export const deletePayment = createAsyncThunk(
  "payments/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payments/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في حذف الدفع");
    }
  }
);

// ============ Slice ============

const paymentSlice = createSlice({
  name: "payments",
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
      .addCase(fetchPayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addPayment.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updatePayment.fulfilled, (state, action) => {
        const index = state.list.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.list = state.list.filter((i) => i.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default paymentSlice.reducer;
