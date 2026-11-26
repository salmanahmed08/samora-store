import React from "react";

export default function ShopLoading() {
  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-10 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner Shimmer */}
        <div className="w-full h-48 sm:h-64 rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.06)]" />

        {/* Filter bar Shimmer */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.08)]">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-8 rounded-xl bg-[#EBE4D8]" />
            ))}
          </div>
          <div className="w-40 h-8 rounded-xl bg-[#EBE4D8]" />
        </div>

        {/* Products Grid Shimmer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
