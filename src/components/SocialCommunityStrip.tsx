"use client";

import React from "react";
import { ArrowUpRight, Heart, MessageCircle, Instagram, Facebook } from "lucide-react";
import { BRAND_CONTACT } from "@/lib/brand-assets";

export default function SocialCommunityStrip() {
  const socialPosts = [
    {
      image: "/assets/editorial-hoodies/hoodie-editorial-06.jpeg",
      likes: "1.4k",
      comments: "84",
      caption: "Heavyweight boxy cut in French Terry cotton. The daily staple for oversized styling.",
      handle: "@samorapk2008",
    },
    {
      image: "/assets/editorial-hoodies/hoodie-editorial-08.jpeg",
      likes: "2.1k",
      comments: "142",
      caption: "Worn on the streets. Dropped shoulders, relaxed chest, 100% natural cotton.",
      handle: "@samorapk2008",
    },
    {
      image: "/assets/editorial-hoodies/hoodie-editorial-09.jpeg",
      likes: "1.8k",
      comments: "98",
      caption: "Handcrafted in Pakistan with uncompromising attention to weight, weave, and drape.",
      handle: "@samorapk2008",
    },
    {
      image: "/assets/editorial-hoodies/hoodie-editorial-10.jpeg",
      likes: "3.4k",
      comments: "210",
      caption: "Monochrome comfort. Pre-shrunk enzyme mineral wash for an ultra soft hand-feel.",
      handle: "@samorapk2008",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F5F1EA] border-b border-[rgba(31,26,23,0.08)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#B55A38] uppercase tracking-wider block mb-1">
            Community & Culture
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#1F1A17]">
            Follow Our Journey
          </h2>
          <p className="text-sm text-[#6B5E54] mt-1">
            Tag <strong className="text-[#1F1A17]">{BRAND_CONTACT.instagramHandle}</strong> on Instagram to be featured on our page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={BRAND_CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.12)] text-xs font-semibold text-[#1F1A17] transition flex items-center gap-2 shadow-sm"
          >
            <Instagram className="w-4 h-4 text-pink-600" />
            <span>Instagram</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6B5E54]" />
          </a>
          <a
            href={BRAND_CONTACT.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-[#FAF8F4] hover:bg-[#EBE4D8] border border-[rgba(31,26,23,0.12)] text-xs font-semibold text-[#1F1A17] transition flex items-center gap-2 shadow-sm"
          >
            <Facebook className="w-4 h-4 text-blue-600" />
            <span>Facebook</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#6B5E54]" />
          </a>
        </div>
      </div>

      {/* Grid of Social Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {socialPosts.map((post, idx) => (
          <a
            key={idx}
            href={BRAND_CONTACT.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-[#FAF8F4] border border-[rgba(31,26,23,0.10)] overflow-hidden group hover:border-[#1F1A17]/30 transition-all duration-300 block shadow-sm hover:shadow-md"
          >
            {/* Visual stage */}
            <div className="relative aspect-square bg-[#EBE4D8] overflow-hidden flex items-center justify-center p-3">
              <img
                src={post.image}
                alt=""
                className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500 drop-shadow-md"
              />

              <div className="absolute top-3 left-3 bg-[#FAF8F4]/90 backdrop-blur-md border border-[rgba(31,26,23,0.10)] px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-[#1F1A17] shadow-sm">
                {post.handle}
              </div>

              {/* Hover overlay stats */}
              <div className="absolute inset-0 bg-[#1F1A17]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-5 text-white text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                  <span>{post.likes}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>{post.comments}</span>
                </span>
              </div>
            </div>

            {/* Caption */}
            <div className="p-4 border-t border-[rgba(31,26,23,0.08)] bg-[#FAF8F4]">
              <p className="text-xs text-[#6B5E54] line-clamp-2 leading-relaxed">
                {post.caption}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
