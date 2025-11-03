import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ===== Helpers =====

// تسطيح/تطبيع عنصر ردّ السيرفر: { batch, subjects } -> { id, ...batch, subjects: [] }
const normalizeBatch = (x) => {
  if (!x) return x;
  if (x.batch) {
    const base = x.batch || {};
    return {
      ...base,
      subjects: Array.isArray(x.subjects) ? x.subjects : [],
    };
  }
  // إن كان أصلاً مسطّحًا { id, ... }
  return {
    ...x,
    subjects: Array.isArray(x.subjects)
      ? x.subjects
      : x.subjects == null
      ? []
      : x.subjects,
  };
};

const unwrapError = (err, fallback) => ({
  status: err?.response?.status,
  message: err?.response?.data?.message || fallback || "حدث خطأ",
  errors: err?.response?.data?.errors || null,
});

// ===== Entity Adapter (مُطبّع + فرز اختياري) =====
const batchesAdapter = createEntityAdapter({
  // بعد normalizeBatch سيكون id دائمًا في الأعلى
  selectId: (b) => b.id,
  // الأحدث أولًا (يمكنك تغييرها لاحقًا)
  sortComparer: (a, b) => String(b.id).localeCompare(String(a.id)),
});

// ===== Thunks =====
export const fetchBatches = createAsyncThunk(
  "batches/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/batches");
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? raw.map(normalizeBatch) : [];
    } catch (e) {
      return rejectWithValue(unwrapError(e, "فشل في جلب الشعب"));
    }
  }
);

export const addBatch = createAsyncThunk(
  "batches/add",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/batches", payload);
      return normalizeBatch(res.data?.data ?? res.data);
    } catch (e) {
      return rejectWithValue(unwrapError(e, "فشل في إضافة الشعبة"));
    }
  }
);

export const updateBatch = createAsyncThunk(
  "batches/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/batches/${id}`, data);
      return normalizeBatch(res.data?.data ?? res.data);
    } catch (e) {
      return rejectWithValue(unwrapError(e, "فشل في تحديث الشعبة"));
    }
  }
);

export const deleteBatch = createAsyncThunk(
  "batches/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/batches/${id}`);
      return id;
    } catch (e) {
      return rejectWithValue(unwrapError(e, "فشل في حذف الشعبة"));
    }
  }
);

// ===== Slice =====
const slice = createSlice({
  name: "batches",
  initialState: batchesAdapter.getInitialState({
    status: "idle", // idle | loading | succeeded | failed
    error: null, // string | {status,message,errors}
  }),
  reducers: {},
  extraReducers: (b) => {
    // Fetch
    b.addCase(fetchBatches.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(fetchBatches.fulfilled, (s, a) => {
      s.status = "succeeded";
      batchesAdapter.setAll(s, a.payload);
      s.error = null;
    });
    b.addCase(fetchBatches.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });

    // Add
    b.addCase(addBatch.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(addBatch.fulfilled, (s, a) => {
      s.status = "succeeded";
      batchesAdapter.addOne(s, a.payload);
      s.error = null;
    });
    b.addCase(addBatch.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });

    // Update
    b.addCase(updateBatch.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(updateBatch.fulfilled, (s, a) => {
      s.status = "succeeded";
      batchesAdapter.upsertOne(s, a.payload);
      s.error = null;
    });
    b.addCase(updateBatch.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });

    // Delete
    b.addCase(deleteBatch.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(deleteBatch.fulfilled, (s, a) => {
      s.status = "succeeded";
      batchesAdapter.removeOne(s, a.payload);
      s.error = null;
    });
    b.addCase(deleteBatch.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });
  },
});

export default slice.reducer;

// ===== Selectors =====
export const {
  selectAll: selectAllBatches,
  selectById: selectBatchById,
  selectIds: selectBatchIds,
} = batchesAdapter.getSelectors((state) => state.batches);
