import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// Get all users
export const fetchUsers = createAsyncThunk(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/users");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في جلب المستخدمين");
    }
  }
);

// Add new user
export const addUser = createAsyncThunk(
  "users/add",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/users", userData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في إضافة المستخدم");
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/users/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في تحديث المستخدم");
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "فشل في حذف المستخدم");
    }
  }
);

// ============ Slice ============
const userSlice = createSlice({
  name: "users",
  initialState: {
    list: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    toggleApproval: (state, action) => {
      const user = state.list.find((u) => u.id === action.payload);
      if (user) user.is_approved = !user.is_approved;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        const p = action.payload;
        state.list = Array.isArray(p)
          ? p
          : Array.isArray(p?.data)
          ? p.data
          : [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addUser.fulfilled, (state, action) => {
        const p = action.payload;
        const user = p?.data ?? p;
        state.list.push(user);
      })
      // Update
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.list.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // Delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      });
  },
});

export const { toggleApproval } = userSlice.actions;
export default userSlice.reducer;
