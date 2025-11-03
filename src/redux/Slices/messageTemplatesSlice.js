// src/store/slices/messageTemplatesSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل قوالب الرسائل
export const fetchMessageTemplates = createAsyncThunk(
  "messageTemplates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/message-templates");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب قوالب الرسائل"
      );
    }
  }
);

// إنشاء قالب جديد
export const addMessageTemplate = createAsyncThunk(
  "messageTemplates/add",
  async (templateData, { rejectWithValue }) => {
    try {
      const res = await api.post("/message-templates", templateData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إنشاء قالب الرسالة"
      );
    }
  }
);

// جلب قالب حسب ID
export const fetchMessageTemplateById = createAsyncThunk(
  "messageTemplates/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/message-templates/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب قالب الرسالة"
      );
    }
  }
);

// تحديث قالب حسب ID
export const updateMessageTemplate = createAsyncThunk(
  "messageTemplates/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/message-templates/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث قالب الرسالة"
      );
    }
  }
);

// حذف قالب حسب ID
export const deleteMessageTemplate = createAsyncThunk(
  "messageTemplates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/message-templates/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف قالب الرسالة"
      );
    }
  }
);

// ============ Slice ============

const messageTemplatesSlice = createSlice({
  name: "messageTemplates",
  initialState: {
    list: [],
    current: null, // القالب الحالي عند fetch by ID
    status: "idle",
    error: null,
  },
  reducers: {
    toggleTemplateActive: (state, action) => {
      const template = state.list.find((t) => t.id === action.payload);
      if (template) template.is_active = !template.is_active;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchMessageTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessageTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMessageTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add
      .addCase(addMessageTemplate.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      // Fetch by ID
      .addCase(fetchMessageTemplateById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessageTemplateById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchMessageTemplateById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update
      .addCase(updateMessageTemplate.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      // Delete
      .addCase(deleteMessageTemplate.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleTemplateActive } = messageTemplatesSlice.actions;
export default messageTemplatesSlice.reducer;
