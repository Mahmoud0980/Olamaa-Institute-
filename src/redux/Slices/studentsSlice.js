// src/redux/features/students/studentsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

/* Helpers */
const unwrapList = (p) =>
  Array.isArray(p) ? p : Array.isArray(p?.data) ? p.data : [];
const unwrapOne = (p) => p?.data ?? p ?? null;

// =======================
// Async Thunks
// =======================

// Get all students
export const fetchStudents = createAsyncThunk(
  "students/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/students");
      // { status, message, data: [...] }
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في جلب الطلاب");
    }
  }
);

// Get one student
export const fetchStudentById = createAsyncThunk(
  "students/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/students/${id}`);
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في جلب بيانات الطالب");
    }
  }
);

// Update student
export const updateStudent = createAsyncThunk(
  "students/update",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      // Use POST + method override (backend only supports POST)
      const res = await api.post(
        `/students/${id}`,
        { _method: "PUT", ...updatedData }
        // If your backend prefers header override, you can use:
        // { headers: { "X-HTTP-Method-Override": "PUT" } }
      );
      return res.data; // often { status, message, data: {...} }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "فشل في تحديث بيانات الطالب"
      );
    }
  }
);
// Delete student
export const deleteStudent = createAsyncThunk(
  "students/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/students/${id}`); // ✅ إصلاح get.delete
      return id; // ✅ نرجّع المعرف فقط
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في حذف الطالب");
    }
  }
);

// =======================
// Slice
// =======================
const studentsSlice = createSlice({
  name: "students",
  initialState: {
    list: [],
    current: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchStudents.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = "succeeded";
        const p = action.payload;
        state.list = unwrapList(p);
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "فشل في جلب الطلاب";
      })

      // fetch by id
      .addCase(fetchStudentById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.status = "succeeded";
        const p = action.payload;
        state.current = unwrapOne(p);
      })
      .addCase(fetchStudentById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || action.error?.message || "فشل في جلب بيانات الطالب";
      })

      // update
      .addCase(updateStudent.pending, (state) => {
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const p = action.payload;
        const updated = unwrapOne(p); // فك التغليف
        if (!updated?.id) return;

        const index = state.list.findIndex((s) => s.id === updated.id);
        if (index !== -1) state.list[index] = updated;

        if (state.current?.id === updated.id) {
          state.current = updated;
        }
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.error =
          action.payload ||
          action.error?.message ||
          "فشل في تحديث بيانات الطالب";
      })

      // delete
      .addCase(deleteStudent.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.list = state.list.filter((s) => s.id !== deletedId);
        if (state.current?.id === deletedId) state.current = null;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.error =
          action.payload || action.error?.message || "فشل في حذف الطالب";
      });
  },
});

export default studentsSlice.reducer;
