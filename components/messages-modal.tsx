"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Mail, Loader2, X, RefreshCw, Key } from "lucide-react";
import { getMessagesAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MessagesModal({
  email,
}: {
  email: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOtpIndex, setSelectedOtpIndex] = useState<number>(0);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMessagesAction(email);
      if (result.success) {
        setMessages(result.messages);
        const firstOtpIndex = result.messages.findIndex((message: any) => Boolean(message.otp));
        setSelectedOtpIndex(firstOtpIndex >= 0 ? firstOtpIndex : 0);
      } else {
        setError(result.message);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    fetchMessages();
  };

  const otpMessages = messages
    .map((message, index) => ({ ...message, index }))
    .filter((message) => Boolean(message.otp));

  const selectedOtpMessage =
    otpMessages.find((message) => message.index === selectedOtpIndex) ?? otpMessages[0] ?? null;

  const handleCopyOtp = async (otp: string) => {
    try {
      await navigator.clipboard.writeText(otp);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = otp;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopiedOtp(otp);
    window.setTimeout(() => {
      setCopiedOtp((current) => (current === otp ? null : current));
    }, 1500);
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />

      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-[32px] overflow-hidden flex flex-col border border-stone-100" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="relative px-8 pt-10 pb-8 text-center border-b border-stone-50 bg-stone-50/30 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="absolute right-6 top-6 rounded-full text-stone-400 hover:bg-stone-100"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="mx-auto w-20 h-20 bg-amber-100 rounded-[28px] flex items-center justify-center mb-6 shadow-sm border border-amber-200">
            <Mail className="h-10 w-10 text-amber-600" />
          </div>
          <h3 className="text-3xl font-black text-stone-900 tracking-tight italic mb-2">HỘP THƯ GPT</h3>
          <p className="text-sm text-stone-500 font-bold uppercase tracking-widest bg-white/80 py-2 px-4 rounded-full border border-stone-100 inline-block">
            {email}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {loading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-6">
                <Loader2 className="h-14 w-14 animate-spin text-amber-500" />
                <RefreshCw className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-600" />
              </div>
              <p className="text-base font-black text-stone-600 animate-pulse uppercase tracking-[0.3em]">Đang quét tin nhắn...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-3xl p-12 text-center border border-red-100">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-700 text-lg font-black mb-2">{error}</p>
              <p className="text-sm text-red-500 mb-8">Chúng tôi chưa thấy email nào gửi đến. Vui lòng kiểm tra lại.</p>
              <Button onClick={fetchMessages} className="rounded-full bg-red-600 text-white font-bold px-10 h-14 shadow-lg shadow-red-200">Thử lại ngay</Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-stone-50 rounded-3xl p-16 text-center border border-dashed border-stone-200">
              <p className="text-sm text-stone-500 font-bold mb-8">Chưa có email nào từ OpenAI được gửi tới địa chỉ này.</p>
              <Button onClick={fetchMessages} className="rounded-full bg-stone-900 text-white font-black px-12 h-14 shadow-2xl">Làm mới hộp thư</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Refresh bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 italic">Tin nhắn nhận được</span>
                <Button variant="outline" size="sm" onClick={fetchMessages} className={`h-10 px-6 rounded-full font-bold border-amber-200 text-amber-700 hover:bg-amber-50 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  QUÉT LẠI
                </Button>
              </div>

              {/* OTP Panel - Tách riêng, hiển thị đầu tiên */}
              {selectedOtpMessage && (
                <div className="rounded-[28px] border border-slate-700 bg-[#17364f] p-8 text-white shadow-2xl">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-sky-200">
                        Mã OTP hiện tại
                      </div>
                      <h4 className="text-base font-black leading-tight text-white">
                        {selectedOtpMessage.subject}
                      </h4>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        {selectedOtpMessage.date}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-white/10 bg-[#10283c] p-6 sm:p-8">
                    <div className="flex flex-col items-center gap-6">
                      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-300">
                        Verification Code
                      </div>
                      <div className="font-mono text-5xl sm:text-6xl font-black tracking-[0.3em] text-white select-all">
                        {selectedOtpMessage.otp}
                      </div>
                      <Button
                        className="w-full max-w-xs h-14 rounded-[20px] bg-emerald-500 text-base font-black text-white shadow-lg shadow-emerald-950/20 transition-all hover:bg-emerald-400 active:scale-95"
                        onClick={() => handleCopyOtp(selectedOtpMessage.otp)}
                      >
                        <Key className="h-5 w-5 mr-2" />
                        {copiedOtp === selectedOtpMessage.otp ? "✓ ĐÃ COPY!" : "COPY MÃ OTP"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message List */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 px-1">Danh sách email</span>
                {messages.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (msg.otp) {
                        setSelectedOtpIndex(idx);
                      }
                    }}
                    className={`w-full rounded-2xl border p-5 text-left transition-all duration-200 ${msg.otp && selectedOtpMessage?.index === idx
                      ? "border-emerald-300 bg-emerald-50 shadow-md"
                      : "border-stone-100 bg-stone-50 hover:border-amber-200 hover:bg-white hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-stone-900 truncate">{msg.subject}</h4>
                        <p className="text-xs text-stone-400 font-medium">{msg.date}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {msg.otp ? (
                          <Badge className="bg-emerald-500 text-white border-none font-mono text-sm px-3">
                            {msg.otp}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-stone-400 border-stone-200 text-[10px]">
                            Không có OTP
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Bot Live</span>
          </div>
          <p className="text-xs text-stone-400 font-bold uppercase italic tracking-tighter">GPT-PREMIUM © 2026</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openModal}
        className="flex items-center gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all rounded-full px-4 font-bold shadow-sm"
      >
        <Mail className="h-4 w-4" />
        LẤY MÃ OTP
      </Button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
