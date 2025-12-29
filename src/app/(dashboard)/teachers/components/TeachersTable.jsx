"use client";

import { useEffect, useState } from "react";
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
  teachers,
  isLoading,
  selectedIds,
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

  const totalPages = Math.ceil(teachers.length / pageSize) || 1;
  const paginated = teachers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [teachers]);

  const toggleSelect = (teacher) => {
    if (selectedIds.includes(teacher.id)) {
      onSelectChange([]);
      onSelectTeacher(null);
    } else {
      onSelectChange([teacher.id]);
      onSelectTeacher(teacher);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 w-full">
      <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
        <thead>
          <tr className="bg-pink-50">
            <th className="p-3 text-center">#</th>
            <th className="p-3">الاسم</th>
            <th className="p-3">الفرع</th>
            <th className="p-3">الاختصاص</th>
            <th className="p-3">الهاتف</th>
            <th className="p-3">تاريخ التعيين</th>
            <th className="p-3 text-center">الإجراءات</th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((t, index) => {
            const rowNumber = (page - 1) * pageSize + index + 1;

            return (
              <tr key={t.id} className="hover:bg-pink-50">
                <td className="p-3 text-center flex gap-2 justify-center">
                  <span>{rowNumber}</span>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(t.id)}
                    onChange={() => toggleSelect(t)}
                    className="w-4 h-4 accent-[#6F013F]"
                  />
                </td>

                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.institute_branch?.name || "—"}</td>
                <td className="p-3">{t.specialization}</td>
                <td className="p-3">{t.phone}</td>
                <td className="p-3">{t.hire_date}</td>

                <td className="p-3 text-center">
                  <ActionsMenu
                    menuId={t.id}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    items={[
                      {
                        label: "تعديل البيانات",
                        icon: Edit,
                        onClick: () => onEdit(t),
                      },
                      {
                        label: "ربط/تعديل المواد",
                        icon: BookOpen,
                        onClick: () => onEditSubjects(t),
                      },
                      {
                        label: "ربط/تعديل الشعب",
                        icon: Layers,
                        onClick: () => onEditBatches(t),
                      },
                      {
                        label: "تعديل الصورة",
                        icon: ImageIcon,
                        onClick: () => onEditPhoto(t),
                      },
                      {
                        label: "حذف",
                        icon: Trash2,
                        danger: true,
                        onClick: () => onDelete(t),
                      },
                    ]}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
