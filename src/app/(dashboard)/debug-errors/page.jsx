"use client";

import { useEffect, useState } from "react";
import { Trash2, RefreshCcw, AlertCircle, Info } from "lucide-react";
import { debugLogger } from "@/lib/helpers/debugLogger";

export default function DebugLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    setLogs(debugLogger.getAll());
  }, []);

  const handleRefresh = () => {
    setLogs(debugLogger.getAll());
  };

  const handleClear = () => {
    if (confirm("هل أنت متأكد من حذف جميع السجلات؟")) {
      debugLogger.clear();
      setLogs([]);
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 flex flex-col gap-6" dir="rtl">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-800">سجل أخطاء النظام (Debug)</h1>
          <p className="text-sm text-gray-500 mt-1">عرض الأخطاء المسجلة محلياً في هذا المتصفح</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
            title="تحديث"
          >
            <RefreshCcw size={20} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
            title="حذف الكل"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Info className="mx-auto text-gray-400 mb-2" size={40} />
            <p className="text-gray-500">لا يوجد أخطاء مسجلة حالياً.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-4 rounded-xl border flex flex-col gap-2 ${
                log.type === "error"
                  ? "bg-red-50 border-red-100"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {log.type === "error" ? (
                    <AlertCircle size={18} className="text-red-500" />
                  ) : (
                    <Info size={18} className="text-blue-500" />
                  )}
                  <span className={`font-bold ${log.type === "error" ? "text-red-700" : "text-gray-800"}`}>
                    {log.type === "error" ? "خطأ" : "سجل"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{log.time}</span>
              </div>
              <p className={`text-sm leading-relaxed ${log.type === "error" ? "text-red-600" : "text-gray-600"}`}>
                {log.message}
              </p>
              {log.data && (
                <pre className="mt-2 p-2 bg-black/5 rounded text-[10px] font-mono overflow-x-auto text-gray-500 max-h-40">
                  {JSON.stringify(JSON.parse(log.data), null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
