import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ================= Async Thunks =================

// جلب كل تفاصيل الاتصال
export const fetchGuardianContacts = createAsyncThunk(
  "guardianContacts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/guardian-contacts");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب تفاصيل الاتصال"
      );
    }
  }
);

// جلب تفاصيل اتصال حسب ID
export const fetchGuardianContactById = createAsyncThunk(
  "guardianContacts/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/guardian-contacts/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب تفاصيل الاتصال"
      );
    }
  }
);

// إضافة تفاصيل اتصال
export const addGuardianContact = createAsyncThunk(
  "guardianContacts/add",
  async (contactData, { rejectWithValue }) => {
    try {
      const res = await api.post("/guardian-contacts", contactData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة تفاصيل الاتصال"
      );
    }
  }
);

// تحديث تفاصيل اتصال
export const updateGuardianContact = createAsyncThunk(
  "guardianContacts/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/guardian-contacts/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث تفاصيل الاتصال"
      );
    }
  }
);

// حذف تفاصيل اتصال
export const deleteGuardianContact = createAsyncThunk(
  "guardianContacts/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/guardian-contacts/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف تفاصيل الاتصال"
      );
    }
  }
);

// ================= Slice =================
const guardianContactsSlice = createSlice({
  name: "guardianContacts",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    setSelectedGuardianContact: (state, action) => {
      state.current = state.list.find((c) => c.id === action.payload) || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchGuardianContacts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGuardianContacts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchGuardianContacts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchGuardianContactById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchGuardianContactById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchGuardianContactById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addGuardianContact.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })

      // Update
      .addCase(updateGuardianContact.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id) {
          state.current = action.payload;
        }
      })

      // Delete
      .addCase(deleteGuardianContact.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { setSelectedGuardianContact } = guardianContactsSlice.actions;
export default guardianContactsSlice.reducer;
