"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, Phone, Check, Trash2, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";
import { useToast } from "@/components/admin/ToastContext";

interface Message {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesClient({ initialMessages }: { initialMessages: Message[] }) {
  const { success, error: toastError } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");

  const filteredMessages = messages.filter((m) => {
    if (filter === "UNREAD") return !m.isRead;
    if (filter === "READ") return m.isRead;
    return true;
  });

  const toggleRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isRead: !currentRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: !currentRead } : m))
        );
        success(`Message marked as ${!currentRead ? "read" : "unread"}`);
      } else {
        toastError("Failed to update status");
      }
    } catch {
      toastError("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        success("Message deleted successfully");
      } else {
        toastError("Failed to delete message");
      }
    } catch {
      toastError("Failed to delete message");
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1F1A17]/10">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1A17] tracking-tight">
            Messages ({messages.length})
          </h1>
          <p className="text-sm text-[#6B5E54] mt-0.5">
            Customer inquiries and messages submitted through your store&apos;s contact page.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "ALL"
                ? "bg-[#2C3A2F] text-white shadow-xs"
                : "bg-white border border-[#1F1A17]/10 text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#FAF8F4]"
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "UNREAD"
                ? "bg-[#2C3A2F] text-white shadow-xs"
                : "bg-white border border-[#1F1A17]/10 text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#FAF8F4]"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("READ")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === "READ"
                ? "bg-[#2C3A2F] text-white shadow-xs"
                : "bg-white border border-[#1F1A17]/10 text-[#6B5E54] hover:text-[#1F1A17] hover:bg-[#FAF8F4]"
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="p-12 border border-[#1F1A17]/10 bg-white rounded-xl text-center space-y-2 max-w-md mx-auto my-6 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#1F1A17]/10 flex items-center justify-center text-[#6B5E54] mx-auto">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#1F1A17]">
            No messages found
          </h3>
          <p className="text-xs text-[#6B5E54]">
            {filter === "ALL"
              ? "Customer inquiries submitted on your contact page will appear here."
              : `There are currently no ${filter.toLowerCase()} messages.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredMessages.map((m) => {
            const waUrl = m.phone
              ? buildWhatsAppLink(
                  m.phone,
                  `Assalam-o-Alaikum ${m.name}! This is Samora responding to your inquiry: "${m.message.slice(
                    0,
                    60
                  )}...". How can we help you?`
                )
              : null;

            return (
              <div
                key={m.id}
                className={`p-5 rounded-xl border transition shadow-xs ${
                  m.isRead
                    ? "bg-white border-[#1F1A17]/10 text-[#1F1A17]"
                    : "bg-white border-[#2C3A2F]/30 text-[#1F1A17] ring-1 ring-[#2C3A2F]/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F1A17]/10 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-[#1F1A17]">
                      {m.name}
                    </span>
                    {!m.isRead ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        New
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FAF8F4] text-[#6B5E54] border border-[#1F1A17]/10">
                        Read
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#6B5E54]">
                    {new Date(m.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-[#6B5E54] flex flex-wrap gap-4 mb-3">
                  {m.phone && (
                    <span className="flex items-center gap-1.5 text-[#1F1A17] font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{m.phone}</span>
                    </span>
                  )}
                  {m.email && (
                    <span className="flex items-center gap-1.5 text-[#1F1A17] font-medium">
                      <Mail className="w-3.5 h-3.5 text-[#6B5E54]" />
                      <a href={`mailto:${m.email}`} className="hover:underline">
                        {m.email}
                      </a>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-[#1F1A17] bg-[#FAF8F4] p-3.5 rounded-lg border border-[#1F1A17]/10">
                  {m.message}
                </p>

                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div>
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply on WhatsApp</span>
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRead(m.id, m.isRead)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F4] hover:bg-[#F5F1EA] border border-[#1F1A17]/10 text-xs font-semibold text-[#1F1A17] transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{m.isRead ? "Mark as Unread" : "Mark as Read"}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F4] hover:bg-red-50 border border-[#1F1A17]/10 text-xs font-semibold text-[#6B5E54] hover:text-red-600 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
