"use client";

import InputField from "@/components/common/InputField";
import SearchableSelect from "@/components/common/SearchableSelect";
import StepButtonsSmart from "@/components/common/StepButtonsSmart";
import { Controller } from "react-hook-form";

import { useGetAcademicBranchesQuery } from "@/store/services/academicBranchesApi";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
/* helpers */
const currentYear = new Date().getFullYear();

const pickFirstError = (errorsObj) => {
  const any = Object.values(errorsObj || {}).find((e) => e?.message);
  return any?.message || "";
};

export default function Step1Student({
  control,
  register,
  errors,
  onNext,
  onBack,
}) {
  /* data */
  const { data: branchesRes } = useGetAcademicBranchesQuery();
  const { data: institutesRes } = useGetInstituteBranchesQuery();

  const branches = branchesRes?.data || [];
  const institutes = institutesRes?.data || [];

  /* submit with toast validation */

  return (
    <div className="space-y-4">
      {/* first name */}
      <InputField
        label="اسم الطالب"
        required
        placeholder="أدخل الاسم"
        register={register("first_name", {
          required: "الاسم مطلوب",
          minLength: {
            value: 2,
            message: "الاسم لا يجب أن يقل عن حرفين",
          },
          maxLength: {
            value: 50,
            message: "الاسم لا يجب أن يتجاوز 50 محرف",
          },
        })}
      />

      {/* last name */}
      <InputField
        label="كنية الطالب"
        required
        placeholder="أدخل الكنية"
        register={register("last_name", {
          required: "الكنية مطلوبة",
          minLength: {
            value: 2,
            message: "الكنية لا يجب أن تقل عن حرفين",
          },
          maxLength: {
            value: 50,
            message: "الكنية لا يجب أن تتجاوز 50 محرف",
          },
        })}
      />

      {/* birth place */}
      <InputField
        label="مكان الولادة"
        required
        placeholder="مثال: دمشق"
        register={register("birth_place", {
          required: "مكان الولادة مطلوب",
          minLength: {
            value: 2,
            message: "مكان الولادة لا يجب أن يقل عن حرفين",
          },
          maxLength: {
            value: 50,
            message: "مكان الولادة لا يجب أن يتجاوز 50 محرف",
          },
        })}
      />

      {/* date of birth */}
      <InputField
        label="تاريخ الولادة"
        type="date"
        required
        register={register("date_of_birth", {
          required: "تاريخ الولادة مطلوب",
          validate: (value) => {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return "تاريخ الولادة غير صالح";

            const y = d.getFullYear();
            if (y >= currentYear)
              return `تاريخ الولادة يجب أن يكون قبل سنة ${currentYear}`;

            return true;
          },
        })}
      />

      {/* national id */}
      <InputField
        label="الرقم الوطني"
        type="text"
        placeholder="10 أرقام فقط"
        required
        register={register("national_id", {
          required: "الرقم الوطني مطلوب",
          pattern: {
            value: /^[0-9]{10}$/,
            message: "يجب إدخال 10 أرقام فقط",
          },
          onChange: (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
          },
        })}
      />

      {/* academic branch */}
      <Controller
        control={control}
        name="branch_id"
        rules={{ required: "الفرع الدراسي مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="الفرع الدراسي"
            required
            value={field.value ? String(field.value) : ""}
            onChange={(v) => {
              const val = typeof v === "object" ? v?.value : v;
              field.onChange(val ? String(val) : "");
            }}
            options={branches.map((b) => ({
              value: String(b.id),
              label: b.name,
            }))}
            placeholder="اختر الفرع"
            allowClear
          />
        )}
      />

      {/* institute branch */}
      <Controller
        control={control}
        name="institute_branch_id"
        rules={{ required: "فرع المعهد مطلوب" }}
        render={({ field }) => (
          <SearchableSelect
            label="فرع المعهد"
            required
            value={field.value ? String(field.value) : ""}
            onChange={(v) => {
              const val = typeof v === "object" ? v?.value : v;
              field.onChange(val ? String(val) : "");
            }}
            options={institutes.map((i) => ({
              value: String(i.id),
              label: i.name,
            }))}
            placeholder="اختر فرع المعهد"
            allowClear
          />
        )}
      />

      {/* navigation */}
      <StepButtonsSmart step={1} total={6} onNext={onNext} onBack={onBack} />
    </div>
  );
}
