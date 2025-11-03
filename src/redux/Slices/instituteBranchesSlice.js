import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الفروع
export const fetchBranches = createAsyncThunk(
  "branches/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/institute-branches");
      return res.data.data; // حسب structure API: data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الفروع"
      );
    }
  }
);
// إضافة فرع جديد
export const addBranch = createAsyncThunk(
  "branches/add",
  async (branchData, { rejectWithValue }) => {
    try {
      const res = await api.post("/institute-branches", branchData);
      return res.data.data; // حسب API response
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الفرع"
      );
    }
  }
);

// جلب فرع حسب ID
export const fetchBranchById = createAsyncThunk(
  "branches/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/institute-branches/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في جلب الفرع");
    }
  }
);

// تحديث فرع حسب ID
export const updateBranch = createAsyncThunk(
  "branches/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/institute-branches/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الفرع"
      );
    }
  }
);

// حذف فرع حسب ID
export const deleteBranch = createAsyncThunk(
  "branches/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/institute-branches/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في حذف الفرع");
    }
  }
);

// ============ Slice ============
const branchSlice = createSlice({
  name: "branches",
  initialState: {
    list: [],
    current: null, // فرع محدد عند fetch by ID
    status: "idle",
    error: null,
  },
  reducers: {
    toggleBranchActive: (state, action) => {
      const branch = state.list.find((b) => b.id === action.payload);
      if (branch) branch.is_active = !branch.is_active;
    },
    setSelectedBranchId: (state, action) => {
      state.selectedBranchId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchBranches.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addBranch.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list]; // العنصر الجديد في البداية
      })
      // Fetch by ID
      .addCase(fetchBranchById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBranchById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchBranchById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateBranch.fulfilled, (state, action) => {
        const index = state.list.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleBranchActive, setSelectedBranchId } = branchSlice.actions;
export default branchSlice.reducer;
