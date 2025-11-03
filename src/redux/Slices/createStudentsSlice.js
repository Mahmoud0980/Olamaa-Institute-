import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// 🟢 جلب جميع الطلاب
export const probeFamily = createAsyncThunk(
  "students/probeFamily",
  async (payload, { rejectWithValue }) => {
    try {
      // 1) جرّب endpoint واضح إنو للفحص فقط
      try {
        const res = await api.post("/enrollments", payload);
        return res.data; // توقّع { message, data:{ family? } ... }
      } catch (e1) {
        // 2) fallback: backends كتير بتدعم query للـ dry-run / probe
        const res = await api.post("/enrollments?probe=1", payload, {
          headers: { "X-Validate-Only": "1" }, // حتى لو تجاهلها السيرفر ما بتضر
        });
        return res.data;
      }
    } catch (err) {
      // مهمّ نرجّع body الأصلي لحتى نقدر نقرأ message/data من الواجهة
      return rejectWithValue(
        err?.response?.data || { message: "Probe failed" }
      );
    }
  }
);
// Create new student
export const addStudent = createAsyncThunk(
  "students/add",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/enrollments", payload, {
        headers: { "Content-Type": "application/json" },
      });
      // نحتاج message + data.family إن وجدت:
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || { message: "فشل في إضافة الطالب" }
      );
    }
  }
);

// ============ Slice ============

const studentsSlice = createSlice({
  name: "students",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    clearCurrentStudent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // مثال: ممكن تضيف هنا التعامل مع fulfilled لو بدك تحدث اللائحة بعد نجاح الإضافة
      .addCase(addStudent.fulfilled, (state, action) => {
        // بعض الـ APIs بترجع {status, message, data}، لو كان data.student موجود أضِفه
        const studentObj =
          action.payload?.data?.student ||
          action.payload?.data || // fallback
          null;
        if (studentObj) {
          state.list.unshift(studentObj);
        }
      });
  },
});
export const { clearCurrentStudent } = studentsSlice.actions;
export default studentsSlice.reducer;
