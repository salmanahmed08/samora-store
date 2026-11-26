import React from "react";

export default function AdminLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse p-2">
      {/* Top Banner Shimmer */}
      <div className="w-full h-32 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] p-6 flex flex-col justify-between">
        <div className="w-48 h-6 rounded-lg bg-[#EBE4D8]" />
        <div className="w-96 h-4 rounded bg-[#EBE4D8]/60" />
      </div>

      {/* Stats Cards Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] p-5 space-y-3"
          >
            <div className="w-20 h-4 rounded bg-[#EBE4D8]" />
            <div className="w-28 h-7 rounded-lg bg-[#EBE4D8]" />
          </div>
        ))}
      </div>

      {/* Main Table Shimmer */}
      <div className="h-80 rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] p-6 space-y-4">
        <div className="w-48 h-6 rounded bg-[#EBE4D8]" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-10 rounded-xl bg-[#EBE4D8]/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
