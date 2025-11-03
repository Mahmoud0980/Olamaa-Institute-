import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الفروع
export const fetchAcademicBranches = createAsyncThunk(
  "academicBranches/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/academic-branches");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الفروع"
      );
    }
  }
);

// إضافة فرع جديد
export const addAcademicBranch = createAsyncThunk(
  "academicBranches/add",
  async (branchData, { rejectWithValue }) => {
    try {
      const res = await api.post("/academic-branches", branchData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الفرع"
      );
    }
  }
);

// جلب فرع حسب ID
export const fetchAcademicBranchById = createAsyncThunk(
  "academicBranches/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/academic-branches/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في جلب الفرع");
    }
  }
);

// تحديث فرع
export const updateAcademicBranch = createAsyncThunk(
  "academicBranches/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/academic-branches/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الفرع"
      );
    }
  }
);

// حذف فرع
export const deleteAcademicBranch = createAsyncThunk(
  "academicBranches/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/academic-branches/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في حذف الفرع");
    }
  }
);

// ============ Slice ============

const academicBranchesSlice = createSlice({
  name: "academicBranches",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
    selectedBranchId: null,
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
      .addCase(fetchAcademicBranches.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAcademicBranches.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchAcademicBranches.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addAcademicBranch.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchAcademicBranchById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAcademicBranchById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchAcademicBranchById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateAcademicBranch.fulfilled, (state, action) => {
        const index = state.list.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteAcademicBranch.fulfilled, (state, action) => {
        state.list = state.list.filter((b) => b.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleBranchActive, setSelectedBranchId } =
  academicBranchesSlice.actions;
export default academicBranchesSlice.reducer;
