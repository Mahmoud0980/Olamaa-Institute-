import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الامتحانات
export const fetchExams = createAsyncThunk(
  "exams/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/exams");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الامتحانات"
      );
    }
  }
);

// إضافة امتحان جديد
export const addExam = createAsyncThunk(
  "exams/add",
  async (examData, { rejectWithValue }) => {
    try {
      const res = await api.post("/exams", examData);
      return res.data.data;
    } catch (err) {
      if (err.errors) return rejectWithValue(err.errors); // خطأ Zod
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الامتحان"
      );
    }
  }
);

// جلب امتحان حسب ID
export const fetchExamById = createAsyncThunk(
  "exams/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/exams/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الامتحان"
      );
    }
  }
);

// تحديث امتحان
export const updateExam = createAsyncThunk(
  "exams/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/exams/${id}`, data);
      return res.data.data;
    } catch (err) {
      if (err.errors) return rejectWithValue(err.errors);
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الامتحان"
      );
    }
  }
);

// حذف امتحان
export const deleteExam = createAsyncThunk(
  "exams/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/exams/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الامتحان"
      );
    }
  }
);

// ============ Slice ============

const examSlice = createSlice({
  name: "exams",
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
      .addCase(fetchExams.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addExam.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchExamById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExamById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchExamById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateExam.fulfilled, (state, action) => {
        const index = state.list.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteExam.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default examSlice.reducer;
