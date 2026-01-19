"use client";

import DashboardButton from "./DashboardButton";

export default function ActionsRow({
  onAdd,
  onView,

  // ⭐ select all
  showSelectAll = false,
  isAllSelected = false,
  onToggleSelectAll,

  // ✅ View All
  showViewAll = false,
  onViewAll,
  viewAllLabel = "عرض كل البيانات",

  // ✅ Extra buttons (مثل دفعات الطلاب والمتأخرين)
  extraButtons = [],

  // labels
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

      {viewLabel && (
        <DashboardButton
          label={viewLabel}
          icon={<i className="text-sm">≡</i>}
          color="green"
          onClick={onView}
        />
      )}

      {/* ✅ زر عرض كل البيانات */}
      {showViewAll && (
        <DashboardButton
          label={viewAllLabel}
          icon={<span className="text-sm">↺</span>}
          color="green"
          onClick={onViewAll}
        />
      )}

      {showSelectAll && (
        <DashboardButton
          label={selectAllLabel}
          icon={
            <input
              type="checkbox"
              checked={isAllSelected}
              readOnly
              className="accent-[#6F013F]"
            />
          }
          color="gray"
          onClick={onToggleSelectAll}
        />
      )}

      {/* ✅ أزرار إضافية */}
      {Array.isArray(extraButtons) &&
        extraButtons.map((btn, idx) => (
          <DashboardButton
            key={btn.key ?? idx}
            label={btn.label}
            icon={btn.icon}
            color={btn.color ?? "green"}
            onClick={btn.onClick}
          />
        ))}
    </div>
  );
}
