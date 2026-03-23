"use client";

import { notify } from "@/lib/helpers/toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import PrintButton from "./PrintButton";
import ExcelButton from "./ExcelButton";

/**
 * Reusable Print and Export Actions Component
 * 
 * @param {Array} data - Full list of data (filtered)
 * @param {Array} selectedIds - Selected row IDs
 * @param {Array} columns - Column definitions [{ header: string, key: string, render: function }]
 * @param {String} filename - Name for Excel file (default: "export")
 * @param {String} title - Title for Print view (default: "بيانات")
 */
export default function PrintExportActions({
  data = [],
  selectedIds = [],
  columns = [],
  filename = "export",
  title = "بيانات",
  rowIdKey = "id",
}) {
  const getSelectedRows = () => {
    // Ensuring type-agnostic comparison
    const sIds = selectedIds.map(String);
    return data.filter((row) => sIds.includes(String(row[rowIdKey])));
  };

  const handlePrint = () => {
    const rows = getSelectedRows();
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد عنصر واحد على الأقل للطباعة");
      return;
    }
    if (!rows.length) {
      notify.error("لا توجد بيانات للطباعة (تأكد من اختيار العناصر من الصفحة الحالية)");
      return;
    }

    const html = `
      <html dir="rtl">
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: right; font-size: 12px; }
            th { background: #f3f3f3; }
            h2 { color: #6F013F; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                ${columns.map((col) => `<th>${col.header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${rows
                .map(
                  (row, i) => `
                <tr>
                  <td>${i + 1}</td>
                  ${columns
                    .map((col) => {
                      let val = row[col.key];
                      if (col.render) {
                        try {
                          val = col.render(val, row);
                        } catch (e) {
                          console.error("Export render error", e);
                        }
                      }
                      return `<td>${val ?? "—"}</td>`;
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "", "width=1000,height=800");
    if (!win) {
      notify.error("المتصفح منع نافذة الطباعة");
      return;
    }
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const handleExcel = () => {
    const rows = getSelectedRows();
    if (selectedIds.length === 0) {
      notify.error("يرجى تحديد عنصر واحد على الأقل للتصدير");
      return;
    }
    if (!rows.length) {
      notify.error("لا توجد بيانات للتصدير");
      return;
    }

    const excelRows = rows.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        let val = row[col.key];
        if (col.render) {
          try {
            val = col.render(val, row);
          } catch (e) {
            console.error("Export render error", e);
          }
        }
        obj[col.header] = val ?? "—";
      });
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), `${filename}.xlsx`);
  };

  return (
    <div className="flex gap-2">
      <PrintButton onClick={handlePrint} />
      <ExcelButton onClick={handleExcel} />
    </div>
  );
}
