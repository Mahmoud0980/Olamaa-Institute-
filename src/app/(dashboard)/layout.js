"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

import "../globals.css";
export default function DashbaordLayout({ children }) {
  //const { list } = useSelector((state) => state.branches);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  return (
    <div dir="rtl" className="h-dvh flex overflow-hidden">
      {/* السايدبار (ثابت + متجاوب) */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* المحتوى */}
      {/*pr-5 pl-5*/}
      <div className="flex-1 flex flex-col h-dvh min-w-0 overflow-hidden">
        <Navbar
          //  branches={list}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
