import React from "react";

export default function RootLoading() {
  return (
    <div className="w-full min-h-[70vh] bg-[#F5F1EA] px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Banner Shimmer */}
        <div className="w-full h-80 sm:h-96 rounded-3xl bg-[#EBE4D8]/80 border border-[rgba(31,26,23,0.06)]" />

        {/* Section Header Shimmer */}
        <div className="space-y-3 max-w-md mx-auto text-center flex flex-col items-center">
          <div className="w-24 h-4 rounded-full bg-[#EBE4D8]" />
          <div className="w-64 h-8 rounded-xl bg-[#EBE4D8]" />
          <div className="w-48 h-3 rounded-full bg-[#EBE4D8]/60" />
        </div>

        {/* Card Grid Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)] p-4 space-y-4 shadow-sm"
            >
              <div className="aspect-[3/4] rounded-2xl bg-[#EBE4D8]" />
              <div className="space-y-2">
                <div className="w-16 h-3 rounded bg-[#EBE4D8]" />
                <div className="w-full h-5 rounded bg-[#EBE4D8]" />
                <div className="w-24 h-4 rounded bg-[#EBE4D8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
