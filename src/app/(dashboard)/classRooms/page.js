"use client";

import { useState, useMemo, useEffect } from "react";

import toast from "react-hot-toast";
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
import { useSelector } from "react-redux";

export default function ClassRoomsPage() {
  const { data, isLoading } = useGetClassRoomsQuery();
  const rooms = data?.data || [];
  const search = useSelector((state) => state.search.values.classRooms);

  const [deleteRoom, { isLoading: deleting }] = useDeleteClassRoomMutation();
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) =>
      room.name?.toLowerCase().includes((search || "").toLowerCase())
    );
  }, [rooms, search]);
  useEffect(() => {
    setSelectedIds([]);
  }, [search]);

  // ===== Selection =====
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    selectedIds.length > 0 && selectedIds.length === rooms.length;

  const toggleSelectAll = () => {
    setSelectedIds(isAllSelected ? [] : rooms.map((r) => r.id));
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
      toast.success("تم حذف القاعة بنجاح");
      setIsDeleteOpen(false);
      setItemToDelete(null);
      setSelectedIds([]);
    } catch {
      toast.error("فشل حذف القاعة");
    }
  };

  // ===== Print =====
  const handlePrint = () => {
    if (selectedIds.length === 0) {
      toast.error("يرجى تحديد قاعة واحدة على الأقل للطباعة");
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
              </tr>`
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
      toast.error("يرجى تحديد قاعة واحدة على الأقل للتصدير");
      return;
    }

    const rows = rooms.filter((r) => selectedIds.includes(r.id));

    const excelRows = rows.map((r) => ({
      الاسم: r.name,
      الكود: r.code,
      السعة: r.capacity,
      ملاحظات: r.notes,
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
        onEdit={setEditItem}
        onDelete={handleDelete}
      />

      <AddClassRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editItem}
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
