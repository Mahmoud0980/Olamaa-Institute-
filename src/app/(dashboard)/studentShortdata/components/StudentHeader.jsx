"use client";

import Avatar from "@/components/common/Avatar";
import PrintButton from "@/components/common/PrintButton";
import ExcelButton from "@/components/common/ExcelButton";

export default function StudentHeader({ student }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <Avatar
          firstName={student.first_name}
          lastName={student.last_name}
          image={student.photo}
        />

        <div>
          <h1 className="text-lg md:text-xl font-bold">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-sm text-gray-500">{student.branch_name}</p>
        </div>
      </div>

      <div className="flex gap-2 self-end md:self-auto">
        <PrintButton onClick={() => window.print()} />
        <ExcelButton onClick={() => console.log("Excel Export")} />
      </div>
    </div>
  );
}
