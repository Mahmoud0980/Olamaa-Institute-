"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";
import { fetchBranches } from "../../redux/Slices/instituteBranchesSlice";
import "../globals.css";
export default function DashbaordLayout({ children }) {
  const { list } = useSelector((state) => state.branches);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  return (
    <div dir="rtl" className="min-h-screen flex">
      {/* السايدبار (ثابت + متجاوب) */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* المحتوى */}
      <div className="flex-1 flex flex-col min-h-screen pr-5 pl-5">
        <Navbar
          branches={list}
          selectedBranchId={selectedBranchId}
          setSelectedBranchId={setSelectedBranchId}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
