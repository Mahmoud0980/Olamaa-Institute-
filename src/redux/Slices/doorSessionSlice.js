import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============ //

// جلب كل الجلسات
export const fetchDoorSessions = createAsyncThunk(
  "doorSessions/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/door-sessions");
      return res.data.data; // حسب structure API: data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الجلسات"
      );
    }
  }
);

// جلب جلسة حسب ID
export const fetchDoorSessionById = createAsyncThunk(
  "doorSessions/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/door-sessions/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الجلسة"
      );
    }
  }
);

// إنشاء جلسة جديدة
export const addDoorSession = createAsyncThunk(
  "doorSessions/add",
  async (sessionData, { rejectWithValue }) => {
    try {
      const res = await api.post("/door-sessions", sessionData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إنشاء الجلسة"
      );
    }
  }
);

// تحديث جلسة حسب ID
export const updateDoorSession = createAsyncThunk(
  "doorSessions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/door-sessions/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الجلسة"
      );
    }
  }
);

// حذف جلسة حسب ID
export const deleteDoorSession = createAsyncThunk(
  "doorSessions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/door-sessions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الجلسة"
      );
    }
  }
);

// ============ Slice ============ //
const doorSessionSlice = createSlice({
  name: "doorSessions",
  initialState: {
    list: [],
    current: null, // جلسة واحدة عند fetchById
    status: "idle",
    error: null,
  },
  reducers: {
    markSessionAsUsed: (state, action) => {
      const session = state.list.find((s) => s.id === action.payload);
      if (session) {
        session.is_used = true;
        session.used_at = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchDoorSessions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoorSessions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchDoorSessions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchDoorSessionById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDoorSessionById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchDoorSessionById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addDoorSession.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })

      // Update
      .addCase(updateDoorSession.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })

      // Delete
      .addCase(deleteDoorSession.fulfilled, (state, action) => {
        state.list = state.list.filter((s) => s.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { markSessionAsUsed } = doorSessionSlice.actions;
export default doorSessionSlice.reducer;
