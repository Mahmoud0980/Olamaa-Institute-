"use client";

import SearchableSelect from "@/components/common/SearchableSelect";

export default function FiltersBar({
  eventValue,
  onEventChange,
  eventOptions,
  userValue,
  onUserChange,
  userOptions,
}) {
  return (
    <div className="p-4 rounded-2xl bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SearchableSelect
          label="فلترة حسب النوع"
          value={eventValue}
          onChange={onEventChange}
          options={eventOptions}
          placeholder="اختر النوع..."
          allowClear
        />

        <SearchableSelect
          label="فلترة حسب المستخدم"
          value={userValue}
          onChange={onUserChange}
          options={userOptions}
          placeholder="اختر المستخدم..."
          allowClear
        />
      </div>
    </div>
  );
}
