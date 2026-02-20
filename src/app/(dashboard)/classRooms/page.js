"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  useGetClassRoomsQuery,
  useDeleteClassRoomMutation,
} from "@/store/services/classRoomsApi";

import ActionsRow from "@/components/common/ActionsRow";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import Breadcrumb from "@/components/common/Breadcrumb";

import ClassRoomsTable from "./components/ClassRoomsTable";
import AddClassRoomModal from "./components/AddClassRoomModal";

export default function ClassRoomsPage() {
  const { data, isLoading } = useGetClassRoomsQuery();
  const rooms = data?.data || [];

  const search = useSelector((state) => state.search.values.classRooms);

  const [deleteRoom, { isLoading: deleting }] = useDeleteClassRoomMutation();

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  // ===== Filtering =====
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) =>
      room.name?.toLowerCase().includes((search || "").toLowerCase()),
    );
  }, [rooms, search]);

  // تنظيف التحديد عند تغير البحث
  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === filteredRooms.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : filteredRooms.map((r) => r.id));
  };

  // ===== Modals =====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRoom(itemToDelete.id).unwrap();
      notify.success("تم حذف القاعة بنجاح");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      setSelectedIds([]);
    } catch (err) {
      notify.error(err?.data?.message || "فشل حذف القاعة");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد قاعة واحدة على الأقل للطباعة");
      return;
    }

    const rows = rooms.filter((r) => selectedIds.includes(r.id));

    const html = `
      <html dir="rtl">
        <body>
          <h3>القاعات</h3>
          <table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
            <tr>
              <th>#</th>
              <th>الاسم</th>
              <th>الكود</th>
              <th>السعة</th>
              <th>ملاحظات</th>
            </tr>
            ${rows
              .map(
                (r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.name}</td>
                <td>${r.code}</td>
                <td>${r.capacity}</td>
                <td>${r.notes || "-"}</td>
              </tr>`,
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  // ===== Excel =====
  const handleExcel = () => {
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد قاعة واحدة على الأقل للتصدير");
      return;
    }

    const rows = rooms.filter((r) => selectedIds.includes(r.id));

    const excelRows = rows.map((r) => ({
      الاسم: r.name,
      الكود: r.code,
      السعة: r.capacity,
      ملاحظات: r.notes || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ClassRooms");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "القاعات.xlsx");
  };

  return (
    <div dir="rtl" className="p-6 flex flex-col gap-6">
      <Breadcrumb />

      <div className="flex justify-between items-center">
        <ActionsRow
          addLabel="إضافة قاعة"
          showSelectAll
          viewLabel=""
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onAdd={() => {
            setEditItem(null);
            setIsModalOpen(true);
          }}
        />

        <div className="flex gap-2">
          <PrintButton onClick={handlePrint} />
          <ExcelButton onClick={handleExcel} />
        </div>
      </div>

      <ClassRoomsTable
        data={filteredRooms}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
        onEdit={(item) => {
          setEditItem(item);
          setIsModalOpen(true);
        }}
        onDelete={handleDelete}
      />

      <AddClassRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editItem}
        rooms={rooms} // ✅ مهم لتوليد الكود تلقائي
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        loading={deleting}
        title="حذف قاعة"
        description={`هل أنت متأكد من حذف القاعة ${itemToDelete?.name}؟`}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
