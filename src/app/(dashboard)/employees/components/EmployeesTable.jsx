"use client";

import { Edit, BookOpen, Image as ImageIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ActionsMenu from "@/components/common/ActionsMenu";
import EmployeesTableSkeleton from "./EmployeesTableSkeleton";
import { useGetInstituteBranchesQuery } from "@/store/services/instituteBranchesApi";
import Pagination from "@/components/common/Pagination";

/* ========= helper: media query ========= */
function useMedia(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function EmployeesTable({
  employees = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onSelectEmployee, // 👈 هذا يلي رح يعرض الدورات (BatchesBox)
  onEdit,
  onDelete,
  onEditBatches,
  onEditPhoto,
  openMenuId,
  setOpenMenuId,
}) {
  const isDesktop = useMedia("(min-width: 768px)");

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
    setOpenMenuId?.(null);
  }, [employees, setOpenMenuId]);

  useEffect(() => {
    setOpenMenuId?.(null);
  }, [page, setOpenMenuId]);

  // ✅ checkbox: للطباعة/الإكسل فقط
  const togglePrintSelect = (empId) => {
    // إذا بدك متعدد: فعل/اطفِ وجوده بالمصفوفة
    if (selectedIds.includes(empId)) {
      onSelectChange(selectedIds.filter((id) => id !== empId));
    } else {
      onSelectChange([...selectedIds, empId]);
    }
  };

  // ✅ ضغط السطر: يعرض الدورات (BatchesBox)
  const handleRowClick = (emp) => {
    onSelectEmployee?.(emp);
    setOpenMenuId?.(null);
  };

  if (isLoading) return <EmployeesTableSkeleton />;

  const renderActions = (emp) => (
    // ✅ حتى الضغط على الأزرار ما يعتبر ضغط على السطر
    <div onClick={(e) => e.stopPropagation()}>
      <ActionsMenu
        menuId={`emp-${emp.id}`}
        openMenuId={openMenuId}
        setOpenMenuId={setOpenMenuId}
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
  );

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= DESKTOP ================= */}
      {isDesktop && (
        <div className="overflow-x-auto">
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
              {paginated.map((emp) => {
                const isChecked = selectedIds.includes(emp.id);

                return (
                  <tr
                    key={emp.id}
                    onClick={() => handleRowClick(emp)} // ✅ ضغط السطر
                    className={`bg-white hover:bg-pink-50 transition cursor-pointer ${
                      // اختياري: تمييز السطر المختار للدورات
                      // إذا حابب تميّز المختار: بدك تمرّر selectedEmployeeId كـ prop
                      ""
                    }`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#6F013F]"
                        checked={isChecked}
                        onClick={(e) => e.stopPropagation()} // ✅ ما يفعّل row click
                        onChange={() => togglePrintSelect(emp.id)} // ✅ للطباعة فقط
                      />
                    </td>

                    <td className="p-3">
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="p-3">{emp.job_title}</td>
                    <td className="p-3" dir="ltr">
                      {emp.phone}
                    </td>
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

                    <td className="p-3 text-center">{renderActions(emp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MOBILE ================= */}
      {!isDesktop && (
        <div className="space-y-4 mt-4">
          {paginated.map((emp) => {
            const isChecked = selectedIds.includes(emp.id);

            return (
              <div
                key={emp.id}
                onClick={() => handleRowClick(emp)} // ✅ ضغط الكرت يعرض الدورات
                className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white cursor-pointer hover:bg-pink-50 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#6F013F]"
                    checked={isChecked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => togglePrintSelect(emp.id)}
                  />
                  {renderActions(emp)}
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
            );
          })}
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
