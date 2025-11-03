import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ================= Async Thunks =================

// جلب كل المدن
export const fetchCities = createAsyncThunk(
  "cities/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/cities");
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "فشل في جلب المدن");
    }
  }
);

// إضافة مدينة جديدة
export const addCity = createAsyncThunk(
  "cities/add",
  async (cityData, { rejectWithValue }) => {
    try {
      const res = await api.post("/cities", cityData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة المدينة"
      );
    }
  }
);

// جلب مدينة حسب ID
export const fetchCityById = createAsyncThunk(
  "cities/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/cities/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب المدينة"
      );
    }
  }
);

// تحديث مدينة
export const updateCity = createAsyncThunk(
  "cities/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/cities/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث المدينة"
      );
    }
  }
);

// حذف مدينة
export const deleteCity = createAsyncThunk(
  "cities/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/cities/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف المدينة"
      );
    }
  }
);

// ================= Slice =================
const citySlice = createSlice({
  name: "cities",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    toggleCityActive: (state, action) => {
      const city = state.list.find((c) => c.id === action.payload);
      if (city) city.is_active = city.is_active ? 0 : 1;
    },
    setSelectedCityId: (state, action) => {
      state.selectedCityId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addCity.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })
      .addCase(fetchCityById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        const index = state.list.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.list = state.list.filter((c) => c.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleCityActive, setSelectedCityId } = citySlice.actions;
export default citySlice.reducer;
