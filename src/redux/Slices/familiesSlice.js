import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ===== Async Thunks =====

// جلب كل العلاقات
export const fetchUserRelations = createAsyncThunk(
  "userRelations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user-relations");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب البيانات"
      );
    }
  }
);

// جلب علاقة معينة حسب ID
export const fetchUserRelationById = createAsyncThunk(
  "userRelations/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/user-relations/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب البيانات"
      );
    }
  }
);

// إضافة علاقة جديدة
export const addUserRelation = createAsyncThunk(
  "userRelations/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/user-relations", data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة البيانات"
      );
    }
  }
);

// تحديث علاقة حسب ID
export const updateUserRelation = createAsyncThunk(
  "userRelations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/user-relations/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث البيانات"
      );
    }
  }
);

// حذف علاقة حسب ID
export const deleteUserRelation = createAsyncThunk(
  "userRelations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/user-relations/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف البيانات"
      );
    }
  }
);

// ===== Slice =====
const userRelationsSlice = createSlice({
  name: "userRelations",
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
      .addCase(fetchUserRelations.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserRelations.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchUserRelations.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchUserRelationById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserRelationById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchUserRelationById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addUserRelation.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Update
      .addCase(updateUserRelation.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteUserRelation.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export default userRelationsSlice.reducer;
