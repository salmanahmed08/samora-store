import React from "react";

export default function ProductLoading() {
  return (
    <div className="w-full min-h-screen bg-[#F5F1EA] py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left gallery shimmer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full rounded-3xl bg-[#EBE4D8] border border-[rgba(31,26,23,0.08)]" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-24 rounded-2xl bg-[#EBE4D8]" />
            ))}
          </div>
        </div>

        {/* Right details shimmer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="w-24 h-5 rounded-full bg-[#EBE4D8]" />
          <div className="w-full h-10 rounded-xl bg-[#EBE4D8]" />
          <div className="w-36 h-8 rounded-lg bg-[#EBE4D8]" />
          <div className="w-full h-24 rounded-2xl bg-[#EBE4D8]/60" />
          <div className="w-full h-14 rounded-2xl bg-[#EBE4D8]" />
        </div>
      </div>
    </div>
  );
}
