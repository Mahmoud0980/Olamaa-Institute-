"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { instituteBranchSchema } from "../../lib/schemas";
import { phoneSchema } from "../../lib/schemas";
import PhoneInput from "./PhoneInput";
import { z } from "zod";

// نجمع الـ branch schema مع phoneSchema حسب الدولة
const createBranchSchema = (countryIso2) =>
  instituteBranchSchema.extend({
    phone: phoneSchema(countryIso2).shape.phone,
    phone_country: z.string().default(countryIso2), // لتخزين كود الدولة
  });

export default function BranchActionModal({
  isOpen,
  onClose,
  onSubmit,
  operation,
  defaultValues,
  onDeleteConfirm,
}) {
  const countryIso2 = defaultValues?.country_code || "SY"; // الدولة الافتراضية أو من البيانات

  const schema = createBranchSchema(countryIso2);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      phone: "",
      phone_country: countryIso2,
      email: "",
      manager_name: "",
      is_active: true,
    },
  });

  const phone = watch("phone");
  const phoneCountry = watch("phone_country");

  // عند فتح الـ Modal في وضع تعديل، تعيين القيم
  useEffect(() => {
    if (defaultValues && operation === "edit") {
      reset({
        ...defaultValues,
        phone: defaultValues.phone || "",
        phone_country: defaultValues.country_code || countryIso2,
      });
    }
  }, [defaultValues, operation, reset, countryIso2]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96">
        {operation === "delete" ? (
          <>
            <h2 className="text-xl font-semibold mb-4">تأكيد الحذف</h2>
            <p className="mb-4">هل أنت متأكد من حذف هذا الفرع؟</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={onDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                حذف
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {operation === "edit" ? "تعديل فرع" : "إضافة فرع"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block mb-1">الاسم</label>
                <input
                  {...register("name")}
                  className="w-full border p-2 rounded"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">الكود</label>
                <input
                  {...register("code")}
                  className="w-full border p-2 rounded"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm">{errors.code.message}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">العنوان</label>
                <input
                  {...register("address")}
                  className="w-full border p-2 rounded"
                />
              </div>
              {/* ===== Phone Input مع Zod validation ===== */}

              <PhoneInput
                name="phone"
                register={register}
                value={phone}
                onChange={async (val, country) => {
                  setValue("phone", String(val), { shouldValidate: true }); // يحدث الفورم ويشغل التحقق
                  setValue("phone_country", String(country));
                  await trigger("phone"); // هذا يتحقق من الحقل فوراً
                }}
                error={errors.phone?.message}
              />
              <div>
                <label className="block mb-1">البريد الإلكتروني</label>
                <input
                  {...register("email")}
                  className="w-full border p-2 rounded"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">اسم المدير</label>
                <input
                  {...register("manager_name")}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" {...register("is_active")} />
                <label>نشط</label>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {operation === "edit" ? "تحديث" : "إضافة"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
