import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ================== Async Thunks ==================

// جلب جميع النتائج
export const fetchExamResults = createAsyncThunk(
  "examResults/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/exam-results");
      return res.data.data; // حسب الـ API structure
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب النتائج"
      );
    }
  }
);

// إضافة نتيجة جديدة
export const addExamResult = createAsyncThunk(
  "examResults/add",
  async (resultData, { rejectWithValue }) => {
    try {
      const res = await api.post("/exam-results", resultData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة النتيجة"
      );
    }
  }
);

// جلب نتيجة حسب ID
export const fetchExamResultById = createAsyncThunk(
  "examResults/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/exam-results/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب النتيجة"
      );
    }
  }
);

// تحديث نتيجة
export const updateExamResult = createAsyncThunk(
  "examResults/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/exam-results/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث النتيجة"
      );
    }
  }
);

// حذف نتيجة
export const deleteExamResult = createAsyncThunk(
  "examResults/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exam-results/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف النتيجة"
      );
    }
  }
);

// ================== Slice ==================
const examResultsSlice = createSlice({
  name: "examResults",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setSelectedExamResultId: (state, action) => {
      state.selectedExamResultId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchExamResults.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExamResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchExamResults.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addExamResult.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchExamResultById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExamResultById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchExamResultById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateExamResult.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteExamResult.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { setSelectedExamResultId } = examResultsSlice.actions;
export default examResultsSlice.reducer;
