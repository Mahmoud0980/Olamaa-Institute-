"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import ActionsMenu from "@/components/common/ActionsMenu";

/* ================= helpers ================= */
const genderLabel = (g) => {
  if (g === "male") return "ذكر";
  if (g === "female") return "أنثى";
  return "—";
};
const guardianFullName = (g) => {
  if (!g) return "—";
  const f = String(g.first_name || "").trim();
  const l = String(g.last_name || "").trim();
  const full = `${f} ${l}`.trim();
  return full || "—";
};

const getFatherName = (row) => {
  const gs = row?.family?.guardians || [];
  const father = gs.find((g) => g.relationship === "father");
  return guardianFullName(father);
};

const getMotherName = (row) => {
  const gs = row?.family?.guardians || [];
  const mother = gs.find((g) => g.relationship === "mother");
  return guardianFullName(mother);
};

/* ================= component ================= */
export default function StudentsTable({
  students = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,
  onAddToBatch,
  onViewDetails,
  onEditStudentInfo,
  onEditFamily,
  onEditAcademic,
  onEditContacts,
  onEditPayments,
}) {
  const safeStudents = Array.isArray(students) ? students : [];

  /* ================= Pagination ================= */
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const totalPages = Math.ceil(safeStudents.length / pageSize) || 1;
  const paginated = safeStudents.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [safeStudents.length]);
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  /* ================= Selection ================= */
  const toggleSelect = (row) => {
    if (!onSelectChange) return;

    const sid = String(row.id);
    const updated = selectedIds.includes(sid)
      ? selectedIds.filter((id) => id !== sid)
      : [...selectedIds, sid];

    onSelectChange(updated);
  };

  /* ================= ActionsMenu ================= */
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuItems = useMemo(() => {
    return (row) => [
      {
        label: "عرض تفاصيل الطالب",
        onClick: () => onViewDetails?.(row),
      },
      {
        label: "تعديل بيانات الطالب",
        onClick: () => onEditStudentInfo?.(row),
      },
      {
        label: "تعديل بيانات العائلة",
        onClick: () => onEditFamily?.(row),
      },
      {
        label: "تعديل المعلومات الأكاديمية",
        onClick: () => onEditAcademic?.(row),
      },
      {
        label: "تعديل معلومات التواصل",
        onClick: () => onEditContacts?.(row),
      },
      {
        label: "إضافة الطالب إلى شعبة",
        onClick: () => onAddToBatch?.(row),
      },
    ];
  }, [
    onViewDetails,
    onEditStudentInfo,
    onEditFamily,
    onEditAcademic,
    onEditContacts,
    onEditPayments,
  ]);

  /* ================= render ================= */
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {isLoading ? (
        <div className="py-10 text-center text-gray-400">جارٍ التحميل...</div>
      ) : !paginated.length ? (
        <div className="py-10 text-center text-gray-400">لا يوجد طلاب.</div>
      ) : (
        <>
          {/* ================= DESKTOP ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-pink-50 text-gray-700">
                  <th className="p-3 text-center rounded-r-xl">#</th>
                  <th className="p-3">الاسم</th>
                  <th className="p-3">الكنية</th>
                  <th className="p-3">اسم الأب</th>
                  <th className="p-3">اسم الأم</th>

                  <th className="p-3">الجنس</th>
                  <th className="p-3">فرع المعهد</th>
                  <th className="p-3">الشعبة</th>
                  <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((row, index) => (
                  <tr
                    key={row.id}
                    className="bg-white hover:bg-pink-50 transition"
                  >
                    <td className="p-3 text-center rounded-r-xl">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.includes(String(row.id))}
                          onChange={() => toggleSelect(row)}
                        />
                        <span>{(page - 1) * pageSize + index + 1}</span>
                      </div>
                    </td>

                    <td className="p-3 font-medium">{row.first_name}</td>
                    <td className="p-3">{row.last_name}</td>
                    <td className="p-3">{getFatherName(row)}</td>
                    <td className="p-3">{getMotherName(row)}</td>
                    <td className="p-3">{genderLabel(row.gender)}</td>
                    <td className="p-3">{row.institute_branch?.name ?? "—"}</td>
                    <td className="p-3">{row.batch?.name ?? "—"}</td>

                    <td className="p-3 text-center rounded-l-xl">
                      <ActionsMenu
                        menuId={`student-${row.id}`}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        items={menuItems(row)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE ================= */}
          <div className="md:hidden space-y-4 mt-4">
            {paginated.map((row, index) => (
              <div
                key={row.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">#</span>
                    <span className="font-semibold">
                      {(page - 1) * pageSize + index + 1}
                    </span>
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selectedIds.includes(String(row.id))}
                      onChange={() => toggleSelect(row)}
                    />
                  </div>

                  <ActionsMenu
                    menuId={`student-m-${row.id}`}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    items={menuItems(row)}
                  />
                </div>

                <Info label="الاسم" value={row.first_name} />
                <Info label="الكنية" value={row.last_name} />
                <Info label="الجنس" value={genderLabel(row.gender)} />
                <Info label="فرع المعهد" value={row.institute_branch?.name} />
                <Info label="الشعبة" value={row.batch?.name} />
              </div>
            ))}
          </div>

          {/* ================= PAGINATION ================= */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

/* ================= Small component ================= */
function Info({ label, value }) {
  return (
    <div className="flex justify-between mb-2">
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
