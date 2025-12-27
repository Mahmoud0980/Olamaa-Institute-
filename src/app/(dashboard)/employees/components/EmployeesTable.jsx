"use client";

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  BookOpen,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import ActionsMenu from "@/components/common/ActionsMenu";
import EmployeesTableSkeleton from "./EmployeesTableSkeleton";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";

export default function EmployeesTable({
  employees = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onSelectEmployee,
  onEdit,
  onDelete,
  onEditBatches,
  onEditPhoto,
}) {
  const { data: branchesData } = useGetInstituteBranchesQuery();
  const branches = branchesData?.data || [];

  const getBranchName = (id) => branches.find((b) => b.id === id)?.name || "-";

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.ceil(employees.length / pageSize) || 1;
  const paginated = employees.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [employees]);

  const toggleSelect = (emp) => {
    const isSelected = selectedIds[0] === emp.id;

    if (isSelected) {
      // إذا ضغط على نفس الموظف → شيل التحديد
      onSelectChange([]);
      onSelectEmployee(null);
    } else {
      // إذا ضغط على موظف تاني → بدّل التحديد
      onSelectChange([emp.id]);
      onSelectEmployee(emp);
    }
  };

  if (isLoading) return <EmployeesTableSkeleton />;

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700">
              <th className="p-3 text-center">#</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الوظيفة</th>
              <th className="p-3">رقم الهاتف</th>
              <th className="p-3">الفرع</th>
              <th className="p-3 text-center">الحالة</th>
              <th className="p-3 text-center">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((emp, index) => (
              <tr key={emp.id} className="bg-white hover:bg-pink-50 transition">
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#6F013F]"
                    checked={selectedIds.includes(emp.id)}
                    onChange={() => toggleSelect(emp)}
                  />
                </td>

                <td className="p-3">
                  {emp.first_name} {emp.last_name}
                </td>
                <td className="p-3">{emp.job_title}</td>
                <td className="p-3">{emp.phone}</td>
                <td className="p-3">
                  {getBranchName(emp.institute_branch_id)}
                </td>

                <td className="p-3 text-center">
                  <span
                    className={`px-3 py-1 text-xs rounded-xl ${
                      emp.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {emp.is_active ? "نشط" : "غير نشط"}
                  </span>
                </td>

                <td className="p-3">
                  <div className="flex justify-center">
                    <ActionsMenu
                      align="right"
                      items={[
                        {
                          label: "تعديل البيانات",
                          icon: Edit,
                          onClick: () => onEdit(emp.id),
                        },
                        {
                          label: "تعديل الصورة",
                          icon: ImageIcon,
                          onClick: () => onEditPhoto(emp.id),
                        },
                        {
                          label: "الدورات",
                          icon: BookOpen,
                          onClick: () => onEditBatches(emp.id),
                        },
                        {
                          label: "حذف",
                          icon: Trash2,
                          danger: true,
                          onClick: () => onDelete(emp),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-4 mt-4">
        {paginated.map((emp) => (
          <div
            key={emp.id}
            className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
          >
            {/* top row */}
            <div className="flex items-center justify-between mb-3">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#6F013F]"
                checked={selectedIds.includes(emp.id)}
                onChange={() => toggleSelect(emp)}
              />

              <ActionsMenu
                align="right"
                items={[
                  {
                    label: "تعديل البيانات",
                    icon: Edit,
                    onClick: () => onEdit(emp.id),
                  },
                  {
                    label: "تعديل الصورة",
                    icon: ImageIcon,
                    onClick: () => onEditPhoto(emp.id),
                  },
                  {
                    label: "الدورات",
                    icon: BookOpen,
                    onClick: () => onEditBatches(emp.id),
                  },
                  {
                    label: "حذف",
                    icon: Trash2,
                    danger: true,
                    onClick: () => onDelete(emp),
                  },
                ]}
              />
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-500">الاسم:</span>
              <span className="font-semibold">
                {emp.first_name} {emp.last_name}
              </span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-500">الوظيفة:</span>
              <span>{emp.job_title}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-500">الهاتف:</span>
              <span>{emp.phone}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="text-gray-500">الفرع:</span>
              <span>{getBranchName(emp.institute_branch_id)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">الحالة:</span>
              <span
                className={`px-3 py-1 text-xs rounded-xl ${
                  emp.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {emp.is_active ? "نشط" : "غير نشط"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="p-2 border rounded-md bg-white disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>

        <span className="text-gray-600 text-sm">
          صفحة {page} من {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="p-2 border rounded-md bg-white disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}
