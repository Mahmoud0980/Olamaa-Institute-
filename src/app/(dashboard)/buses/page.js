"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchBuses,
  addBus,
  updateBus,
  deleteBus,
  setSelectedBusId,
} from "../../../redux/Slices/busesSlice";
import { busSchema } from "../../../lib/schemas";

export default function BusPage() {
  const dispatch = useDispatch();
  const { list, current, status, error } = useSelector((state) => state.buses);

  const [formMode, setFormMode] = useState("add"); // add or edit

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(busSchema),
  });

  // جلب البيانات عند التحميل
  useEffect(() => {
    dispatch(fetchBuses());
  }, [dispatch]);

  // إذا تغير current (edit)، نملأ الفورم
  useEffect(() => {
    if (current && formMode === "edit") {
      reset(current);
    }
  }, [current, formMode, reset]);

  // ====== Form Submit ======
  const onSubmit = (data) => {
    if (formMode === "add") {
      dispatch(addBus(data)).then(() => reset());
    } else if (formMode === "edit" && current) {
      dispatch(updateBus({ id: current.id, data })).then(() => reset());
      setFormMode("add");
    }
  };

  // ====== Edit & Delete ======
  const handleEdit = (bus) => {
    dispatch(setSelectedBusId(bus.id));
    setFormMode("edit");
  };

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الباص؟")) {
      dispatch(deleteBus(id));
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* القسم الأول: Form */}
      <div className="w-1/2 p-6">
        <h2 className="text-xl font-bold mb-4">
          {formMode === "add" ? "إضافة باص جديد" : "تعديل الباص"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">اسم الباص</label>
            <input
              type="text"
              {...register("name")}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">السعة</label>
            <input
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">اسم السائق</label>
            <input
              type="text"
              {...register("driver_name")}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.driver_name && (
              <p className="text-red-500 text-sm">
                {errors.driver_name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1">وصف المسار</label>
            <input
              type="text"
              {...register("route_description")}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.route_description && (
              <p className="text-red-500 text-sm">
                {errors.route_description.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" {...register("is_active")} />
            <span>نشط</span>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {formMode === "add" ? "إضافة" : "تحديث"}
          </button>
          {formMode === "edit" && (
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
              onClick={() => {
                reset();
                setFormMode("add");
              }}
            >
              إلغاء
            </button>
          )}
        </form>
      </div>

      {/* الخط الفاصل */}
      <div className="w-1 bg-gray-300"></div>

      {/* القسم الثاني: Table */}
      <div className="w-1/2 p-6 overflow-auto">
        <h2 className="text-xl font-bold mb-4">قائمة الباصات</h2>
        {status === "loading" && <p>جاري التحميل...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">الاسم</th>
              <th className="border px-2 py-1">السعة</th>
              <th className="border px-2 py-1">السائق</th>
              <th className="border px-2 py-1">المسار</th>
              <th className="border px-2 py-1">نشط</th>
              <th className="border px-2 py-1">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((bus) => (
              <tr key={bus.id}>
                <td className="border px-2 py-1">{bus.id}</td>
                <td className="border px-2 py-1">{bus.name}</td>
                <td className="border px-2 py-1">{bus.capacity}</td>
                <td className="border px-2 py-1">{bus.driver_name}</td>
                <td className="border px-2 py-1">{bus.route_description}</td>
                <td className="border px-2 py-1">
                  {bus.is_active ? "نعم" : "لا"}
                </td>
                <td className="border px-2 py-1 space-x-2">
                  <button
                    className="bg-yellow-400 px-2 py-1 rounded"
                    onClick={() => handleEdit(bus)}
                  >
                    تعديل
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDelete(bus.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
