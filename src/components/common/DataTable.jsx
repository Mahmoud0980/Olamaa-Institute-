"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination";
import TableSkeleton from "@/components/common/TableSkeleton";

/**
 * Reusable DataTable Component
 * 
 * @param {Array} data - The raw data array
 * @param {Array} columns - Column definitions [{ header: string, key: string, render: (val, row) => JSX }]
 * @param {Boolean} isLoading - Loading state
 * @param {Array} selectedIds - Selected row IDs
 * @param {Function} onSelectChange - Selection callback
 * @param {Number} pageSize - Rows per page
 * @param {Function} renderActions - Action column renderer (row, isMobile) => JSX
 * @param {String} emptyMessage - Message shown when data is empty
 * @param {String} rowIdKey - Key for row identity (default 'id')
 * @param {Boolean} showCheckbox - Whether to show checkboxes
 * @param {Function} mobileRender - Custom mobile card renderer
 */
export default function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  selectedIds = [],
  onSelectChange,
  pageSize = 6,
  renderActions,
  emptyMessage = "لا توجد بيانات",
  rowIdKey = "id",
  getRowId, // New prop
  showCheckbox = true,
  mobileRender,
  onRowClick,
  // Server-side pagination props
  serverSide = false,
  currentPage = 1,
  totalPages: serverTotalPages,
  onPageChange: onServerPageChange,
}) {
  const safeData = Array.isArray(data) ? data : [];

  const getInternalId = (row) => {
    if (getRowId) return String(getRowId(row));
    return String(row[rowIdKey]);
  };

  // ===== Pagination =====
  const [localPage, setLocalPage] = useState(1);
  
  const page = serverSide ? currentPage : localPage;
  
  const setPage = (p) => {
    if (serverSide) {
      onServerPageChange?.(p);
    } else {
      setLocalPage(p);
      onServerPageChange?.(p);
    }
  };
  
  const totalPages = serverSide ? serverTotalPages : (Math.ceil(safeData.length / pageSize) || 1);
  const paginated = serverSide ? safeData : safeData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (!serverSide) setLocalPage(1);
  }, [safeData.length, serverSide]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);

  // ===== Checkbox =====
  const toggleSelect = (row) => {
    if (!onSelectChange) return;

    const id = getInternalId(row);
    const exists = selectedIds.map(String).includes(String(id));
    const updated = exists
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];

    onSelectChange(updated);
  };

  if (isLoading) {
    return (
      <TableSkeleton
        headers={[
          "#",
          ...columns.map((c) => c.header),
          renderActions ? "إجراءات" : null,
        ].filter(Boolean)}
        rows={pageSize}
        showCheckbox={showCheckbox}
        actionCount={2}
      />
    );
  }

  if (!safeData.length) {
    return (
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-10 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-5 w-full">
      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-right border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-pink-50 text-gray-700">
              <th className="p-3 text-center rounded-r-xl">#</th>
              {columns.map((col, i) => (
                <th key={i} className="p-3">
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th className="p-3 text-center rounded-l-xl">الإجراءات</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.map((row, index) => {
              const id = getInternalId(row);
              const isLastColumnRounded = !renderActions;
              
              return (
                <tr 
                  key={id} 
                  className={`bg-white hover:bg-pink-50 transition ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  <td className="p-3 text-center rounded-r-xl">
                    <div className="flex items-center justify-center gap-2">
                      {showCheckbox && (
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#6F013F]"
                          checked={selectedIds.map(String).includes(String(id))}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleSelect(row)}
                        />
                      )}
                      <span>{(page - 1) * pageSize + index + 1}</span>
                    </div>
                  </td>

                  {columns.map((col, i) => {
                    const isLast = isLastColumnRounded && i === columns.length - 1;
                    return (
                      <td key={i} className={`p-3 ${isLast ? "rounded-l-xl" : ""}`}>
                        {col.render
                          ? col.render(row[col.key], row, index, page, pageSize)
                          : (row[col.key] ?? "—")}
                      </td>
                    );
                  })}

                  {renderActions && (
                    <td className="p-3 rounded-l-xl text-center">
                      {renderActions(row, false)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="md:hidden space-y-4 mt-4">
        {paginated.map((row, index) => {
          const id = getInternalId(row);
          if (mobileRender) return mobileRender(row, index, page, pageSize, toggleSelect, selectedIds.includes(id));

          return (
            <div
              key={id}
              className={`border border-gray-200 rounded-xl p-4 shadow-sm ${onRowClick ? "cursor-pointer hover:bg-pink-50 transition" : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">#</span>
                  <span className="font-semibold">
                    {(page - 1) * pageSize + index + 1}
                  </span>
                  {showCheckbox && (
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#6F013F]"
                      checked={selectedIds.map(String).includes(String(id))}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(row)}
                    />
                  )}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    {renderActions && renderActions(row, true)}
                </div>
              </div>

              {columns.map((col, i) => (
                <div key={i} className="flex justify-between mb-2">
                  <span className="text-gray-500">{col.header}:</span>
                  <span className="font-medium text-left">
                    {col.render
                      ? col.render(row[col.key], row, index, page, pageSize)
                      : (row[col.key] ?? "—")}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
