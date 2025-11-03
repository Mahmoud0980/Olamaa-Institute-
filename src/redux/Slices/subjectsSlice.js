// src/store/slices/subjectsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل المواد
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/subjects");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المواد"
      );
    }
  }
);

// إضافة مادة جديدة
export const addSubject = createAsyncThunk(
  "subjects/add",
  async (subjectData, { rejectWithValue }) => {
    try {
      const res = await api.post("/subjects", subjectData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة المادة"
      );
    }
  }
);

// جلب مادة حسب ID
export const fetchSubjectById = createAsyncThunk(
  "subjects/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/subjects/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المادة"
      );
    }
  }
);

// تحديث مادة حسب ID
export const updateSubject = createAsyncThunk(
  "subjects/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/subjects/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث المادة"
      );
    }
  }
);

// حذف مادة حسب ID
export const deleteSubject = createAsyncThunk(
  "subjects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/subjects/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف المادة"
      );
    }
  }
);

// ============ Slice ============

const subjectsSlice = createSlice({
  name: "subjects",
  initialState: {
    list: [],
    current: null, // مادة محددة عند fetch by ID
    status: "idle",
    error: null,
  },
  reducers: {
    toggleSubjectActive: (state, action) => {
      const subject = state.list.find((s) => s.id === action.payload);
      if (subject) subject.is_active = !subject.is_active;
    },
    setSelectedSubjectId: (state, action) => {
      state.selectedSubjectId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchSubjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addSubject.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchSubjectById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubjectById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchSubjectById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateSubject.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteSubject.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleSubjectActive, setSelectedSubjectId } =
  subjectsSlice.actions;
export default subjectsSlice.reducer;
