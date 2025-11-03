import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";
import { z } from "zod";

// ================= Async Thunks ==================

// جلب كل المدرسين
export const fetchTeachers = createAsyncThunk(
  "teachers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/teachers");
      return res.data.data; // حسب structure API: data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المدرسين"
      );
    }
  }
);

// إضافة مدرس جديد
export const addTeacher = createAsyncThunk(
  "teachers/add",
  async (teacherData, { rejectWithValue }) => {
    try {
      const res = await api.post("/teachers", teacherData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة المدرس"
      );
    }
  }
);

// جلب مدرس حسب ID
export const fetchTeacherById = createAsyncThunk(
  "teachers/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/teachers/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المدرس"
      );
    }
  }
);

// تحديث مدرس حسب ID
export const updateTeacher = createAsyncThunk(
  "teachers/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/teachers/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث المدرس"
      );
    }
  }
);

// حذف مدرس حسب ID
export const deleteTeacher = createAsyncThunk(
  "teachers/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/teachers/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف المدرس"
      );
    }
  }
);

// ================= Slice ==================
const teacherSlice = createSlice({
  name: "teachers",
  initialState: {
    list: [],
    current: null, // مدرس محدد عند fetch by ID
    status: "idle",
    error: null,
  },
  reducers: {
    setSelectedTeacherId: (state, action) => {
      state.selectedTeacherId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchTeachers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addTeacher.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchTeacherById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchTeacherById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateTeacher.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { setSelectedTeacherId } = teacherSlice.actions;
export default teacherSlice.reducer;
