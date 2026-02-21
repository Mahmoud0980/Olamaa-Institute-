"use client";

function normalize(v) {
  if (v === undefined || v === null) return "";
  return String(v);
}

function safeObj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

export default function DiffRows({
  event,
  oldValues,
  newValues,
  compact = false,
  limit = 4,
}) {
  const oldObj = safeObj(oldValues);
  const newObj = safeObj(newValues);

  // keys union
  const keys = Array.from(
    new Set([...Object.keys(oldObj), ...Object.keys(newObj)]),
  );

  let rows = [];

  if (event === "created") {
    rows = keys
      .filter((k) => normalize(newObj[k]) !== "")
      .map((k) => ({ k, old: null, next: newObj[k], changed: true }));
  } else if (event === "deleted") {
    rows = keys
      .filter((k) => normalize(oldObj[k]) !== "")
      .map((k) => ({ k, old: oldObj[k], next: null, changed: true }));
  } else {
    // updated: only changed
    rows = keys
      .map((k) => {
        const o = oldObj[k];
        const n = newObj[k];
        const changed = normalize(o) !== normalize(n);
        return changed ? { k, old: o, next: n, changed } : null;
      })
      .filter(Boolean);
  }

  const hasMore = compact && rows.length > limit;
  const shown = compact ? rows.slice(0, limit) : rows;

  return (
    <div className="rounded-xl  bg-white/60">
      {/* table header */}
      <div className="px-3 py-2  bg-white/70 rounded-t-xl">
        <div className="grid grid-cols-12 gap-2 text-[11px]  text-gray-500 font-medium">
          <div className="col-span-4">الحقل</div>
          <div className="col-span-4">Old</div>
          <div className="col-span-4">New</div>
        </div>
      </div>

      {/* rows */}
      <div className="">
        {shown.length === 0 ? (
          <div className="px-3 py-3 text-[12px] text-gray-500">
            لا يوجد تغييرات واضحة
          </div>
        ) : (
          shown.map((r) => (
            <Row
              key={r.k}
              event={event}
              kName={r.k}
              oldV={r.old}
              newV={r.next}
            />
          ))
        )}
      </div>

      {hasMore && (
        <div className="px-3 py-2 text-[11px] text-gray-500">
          + {rows.length - limit} حقول أخرى (افتح “تفاصيل أكثر”)
        </div>
      )}
    </div>
  );
}

function Row({ event, kName, oldV, newV }) {
  const oldText =
    oldV === null || oldV === undefined || oldV === "" ? "—" : String(oldV);
  const newText =
    newV === null || newV === undefined || newV === "" ? "—" : String(newV);

  // تلوين القيم حسب الحدث
  const oldBox =
    event === "created"
      ? "bg-gray-50"
      : event === "deleted"
        ? "bg-red-50/60 border-red-100"
        : "bg-orange-50/60 border-orange-100"; // updated old
  const newBox =
    event === "deleted"
      ? "bg-gray-50"
      : event === "created"
        ? "bg-blue-50/60 border-blue-100"
        : "bg-green-50/60 border-green-100"; // updated new

  return (
    <div className="px-3 py-2">
      <div className="grid grid-cols-12 gap-2 items-start">
        <div className="col-span-4 text-[12px] text-gray-700 font-medium break-words">
          {kName}
        </div>

        <div
          className={`col-span-4 rounded-lg  px-2 py-1 text-[12px] text-gray-800 break-words ${oldBox}`}
        >
          {oldText}
        </div>

        <div
          className={`col-span-4 rounded-lg  px-2 py-1 text-[12px] text-gray-800 break-words ${newBox}`}
        >
          {newText}
        </div>
      </div>
    </div>
  );
}
