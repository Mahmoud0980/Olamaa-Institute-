import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../lib/config/axiosConfig";

// ============ Async Thunks ============

// جلب كل الموظفين
export const fetchEmployees = createAsyncThunk(
  "employees/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/employees");
      return res.data.data; // حسب API: data.data
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الموظفين"
      );
    }
  }
);

// إضافة موظف جديد
export const addEmployee = createAsyncThunk(
  "employees/add",
  async (employeeData, { rejectWithValue }) => {
    try {
      const res = await api.post("/employees", employeeData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في إضافة الموظف"
      );
    }
  }
);

// جلب موظف حسب ID
export const fetchEmployeeById = createAsyncThunk(
  "employees/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/employees/${id}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في جلب الموظف"
      );
    }
  }
);

// تحديث موظف
export const updateEmployee = createAsyncThunk(
  "employees/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/employees/${id}`, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في تحديث الموظف"
      );
    }
  }
);

// حذف موظف
export const deleteEmployee = createAsyncThunk(
  "employees/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/employees/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "فشل في حذف الموظف"
      );
    }
  }
);

// ============ Slice ============

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    error: null,
  },
  reducers: {
    toggleEmployeeActive: (state, action) => {
      const employee = state.list.find((e) => e.id === action.payload);
      if (employee) employee.is_active = !employee.is_active;
    },
    setSelectedEmployeeId: (state, action) => {
      state.selectedEmployeeId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Add
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.list = [action.payload, ...state.list];
      })

      // Fetch by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.list.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.current?.id === action.payload.id)
          state.current = action.payload;
      })

      // Delete
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { toggleEmployeeActive, setSelectedEmployeeId } =
  employeeSlice.actions;
export default employeeSlice.reducer;
