"use client";

import DashboardButton from "./DashboardButton";

export default function ActionsRow({
  onAdd,
  onView,
  onSelectAll,
  showSelectAll = false,

  // ⭐ أسماء الأزرار القابلة للتغيير ديناميكيًا
  addLabel = "إضافة عنصر",
  viewLabel = "عرض البيانات",
  selectAllLabel = "تحديد الكل",
}) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <DashboardButton
        label={addLabel}
        icon={<span className="text-md">+</span>}
        color="pink"
        onClick={onAdd}
      />

      <DashboardButton
        label={viewLabel}
        icon={<i className="text-sm">≡</i>}
        color="green"
        onClick={onView}
      />

      {showSelectAll && (
        <DashboardButton
          label={selectAllLabel}
          icon={<input type="checkbox" className="accent-[#6F013F]" />}
          color="gray"
          onClick={onSelectAll}
        />
      )}
    </div>
  );
}
