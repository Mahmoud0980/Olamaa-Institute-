"use client";

import { useEffect, useMemo, useState } from "react";
import ActionsMenu from "@/components/common/ActionsMenu";
import Pagination from "@/components/common/Pagination";
import {
  Edit,
  BookOpen,
  Layers,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

export default function TeachersTable({
  teachers = [],
  isLoading,
  selectedIds = [],
  onSelectChange,
  onSelectTeacher,
  onEdit,
  onEditPhoto,
  onEditBatches,
  onEditSubjects,
  onDelete,
  openMenuId,
  setOpenMenuId,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const safeTeachers = Array.isArray(teachers) ? teachers : [];

  const totalPages = Math.ceil(safeTeachers.length / pageSize) || 1;

  const paginated = useMemo(() => {
    return safeTeachers.slice((page - 1) * pageSize, page * pageSize);
  }, [safeTeachers, page]);

  useEffect(() => setPage(1), [safeTeachers]);
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  // ✅ checkbox: multi select
  const toggleCheck = (teacherId) => {
    const updated = selectedIds.includes(teacherId)
      ? selectedIds.filter((id) => id !== teacherId)
      : [...selectedIds, teacherId];

    onSelectChange?.(updated);
  };

  // ✅ row click: open details (بدون ما يغير selectedIds)
  const openDetails = (t) => {
    onSelectTeacher?.(t);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
        <div className="py-10 text-center text-gray-500">جارٍ التحميل...</div>
      </div>
    );
  }

  if (safeTeachers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
        <div className="py-10 text-center text-gray-400">لا توجد بيانات.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700">
              <th className="p-3 text-center rounded-r-xl">#</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الفرع</th>
              <th className="p-3">الاختصاص</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">تاريخ التعيين</th>
              <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((t, index) => {
              const rowNumber = (page - 1) * pageSize + index + 1;

              return (
                <tr
                  key={t.id}
                  onClick={() => openDetails(t)}
                  className="bg-white hover:bg-pink-50 transition cursor-pointer"
                >
                  <td className="p-3 text-center rounded-r-xl">
                    <div className="flex gap-2 justify-center items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(t.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleCheck(t.id)}
                        className="w-4 h-4 accent-[#6F013F]"
                      />
                      <span>{rowNumber}</span>
                    </div>
                  </td>

                  <td className="p-3 font-medium whitespace-nowrap">
                    {t.name}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {t.institute_branch?.name || "—"}
                  </td>
                  <td className="p-3 whitespace-nowrap">{t.specialization}</td>
                  <td className="p-3 whitespace-nowrap">{t.phone}</td>
                  <td className="p-3 whitespace-nowrap">{t.hire_date}</td>

                  <td
                    className="p-3 text-center rounded-l-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionsMenu
                      menuId={t.id}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                      items={[
                        {
                          label: "تعديل البيانات",
                          icon: Edit,
                          onClick: () => onEdit?.(t),
                        },
                        {
                          label: "ربط/تعديل المواد",
                          icon: BookOpen,
                          onClick: () => onEditSubjects?.(t),
                        },
                        {
                          label: "ربط/تعديل الشعب",
                          icon: Layers,
                          onClick: () => onEditBatches?.(t),
                        },
                        {
                          label: "تعديل الصورة",
                          icon: ImageIcon,
                          onClick: () => onEditPhoto?.(t),
                        },
                        {
                          label: "حذف",
                          icon: Trash2,
                          danger: true,
                          onClick: () => onDelete?.(t),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {paginated.map((t, index) => {
          const rowNumber = (page - 1) * pageSize + index + 1;

          return (
            <div
              key={t.id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm"
              onClick={() => openDetails(t)}
              role="button"
            >
              {/* checkbox + index */}
              <div className="flex justify-between mb-3">
                <span className="text-gray-500">#</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{rowNumber}</span>
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#6F013F]"
                    checked={selectedIds.includes(t.id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleCheck(t.id)}
                  />
                </div>
              </div>

              <Row label="الاسم" value={t.name} strong />
              <Row label="الفرع" value={t.institute_branch?.name || "—"} />
              <Row label="الاختصاص" value={t.specialization || "—"} />
              <Row label="الهاتف" value={t.phone || "—"} />
              <Row label="تاريخ التعيين" value={t.hire_date || "—"} />

              <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                {/* ActionsMenu على الموبايل */}
                <div className="flex justify-center">
                  <ActionsMenu
                    menuId={t.id}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    items={[
                      {
                        label: "تعديل البيانات",
                        icon: Edit,
                        onClick: () => onEdit?.(t),
                      },
                      {
                        label: "ربط/تعديل المواد",
                        icon: BookOpen,
                        onClick: () => onEditSubjects?.(t),
                      },
                      {
                        label: "ربط/تعديل الشعب",
                        icon: Layers,
                        onClick: () => onEditBatches?.(t),
                      },
                      {
                        label: "تعديل الصورة",
                        icon: ImageIcon,
                        onClick: () => onEditPhoto?.(t),
                      },
                      {
                        label: "حذف",
                        icon: Trash2,
                        danger: true,
                        onClick: () => onDelete?.(t),
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      {safeTeachers.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
