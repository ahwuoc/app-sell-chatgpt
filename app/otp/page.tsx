"use client";

import React, { useState } from "react";
import { Mail, RefreshCw, Key, ArrowRight, ShieldCheck, Clipboard, Check, HelpCircle } from "lucide-react";
import { getOtpPublicAction } from "../otp-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function OtpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [clientId, setClientId] = useState("");

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOtpIndex, setSelectedOtpIndex] = useState<number>(0);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const fetchOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const result = await getOtpPublicAction(email, password, refreshToken, clientId);
      if (result.success && result.messages) {
        setMessages(result.messages);
        const firstOtpIndex = result.messages.findIndex((message: any) => Boolean(message.otp));
        setSelectedOtpIndex(firstOtpIndex >= 0 ? firstOtpIndex : 0);
      } else {
        setError(result.message || "Không thể lấy tin nhắn. Hãy kiểm tra lại thông tin cấu hình.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1500);
    } catch (e) {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 1500);
    }
  };

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
    setTimeout(() => {
      setCopiedOtp(null);
    }, 1500);
  };

  const otpMessages = messages
    .map((message, index) => ({ ...message, index }))
    .filter((message) => Boolean(message.otp));

  const selectedOtpMessage =
    otpMessages.find((message) => message.index === selectedOtpIndex) ?? otpMessages[0] ?? null;

  const handleFastPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const parts = text.split("|").map((p) => p.trim());
    if (parts.length >= 4) {
      e.preventDefault();
      setEmail(parts[0] || "");
      setPassword(parts[1] || "");
      setRefreshToken(parts[2] || "");
      setClientId(parts[3] || "");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
              <Mail className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              OTP Hotmail
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors flex items-center gap-1 group"
            >
              Cửa hàng
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: input form */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent sm:text-4xl">
              Lấy Mã OTP Hotmail / Outlook
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Công cụ trực tuyến lấy mã xác nhận OTP từ hòm thư Hotmail thông qua giao thức kết nối bảo mật OAuth2.
            </p>
          </div>

          {/* Fast Import Guide Card */}
          <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-300">
                <HelpCircle className="h-4 w-4 text-amber-400" />
                Mẹo nhập nhanh (Fast Paste)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-2">
              <p>
                Bạn có thể sao chép chuỗi tài khoản dạng:
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg font-mono text-[10px] text-amber-300 border border-slate-800/60 break-all select-all flex items-center justify-between">
                <span>email | pass | refresh_token | client_id</span>
                <button
                  onClick={() => handleCopy("email|pass|refresh_token|client_id")}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title="Sao chép mẫu"
                >
                  {copiedText ? <Check className="h-3 w-3 text-green-400" /> : <Clipboard className="h-3 w-3" />}
                </button>
              </div>
              <p className="italic text-slate-500">
                👉 Sau đó nhấn vào ô Email và dán vào (Ctrl+V) để tự động điền đầy đủ các ô còn lại.
              </p>
            </CardContent>
          </Card>

          {/* Config Form */}
          <Card className="border-slate-800/80 bg-slate-900/40 backdrop-blur-lg shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-blue-500" />
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                Cấu hình tài khoản
              </CardTitle>
              <CardDescription className="text-slate-500">
                Nhập thông tin đăng nhập và token để quét email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={fetchOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Địa chỉ Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@hotmail.com hoặc outlook.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onPaste={handleFastPaste}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white rounded-xl h-11 placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pass" className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Mật khẩu Email
                  </label>
                  <Input
                    id="pass"
                    type="password"
                    placeholder="Mật khẩu của email"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white rounded-xl h-11 placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="refreshToken" className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Refresh Token (OAuth2)
                  </label>
                  <Input
                    id="refreshToken"
                    placeholder="Chuỗi refresh token dài..."
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white rounded-xl h-11 placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="clientId" className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Client ID (OAuth2)
                  </label>
                  <Input
                    id="clientId"
                    placeholder="Chuỗi Client ID"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="bg-slate-950 border-slate-800 focus-visible:ring-amber-500 text-white rounded-xl h-11 placeholder:text-slate-600"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold rounded-xl shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ĐANG QUÉT EMAIL...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2" />
                      QUÉT HỘP THƯ
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* Right column: results */}
        <section className="lg:col-span-7 flex flex-col">
          <Card className="border-slate-800/80 bg-slate-900/30 backdrop-blur-lg flex-1 flex flex-col rounded-2xl overflow-hidden shadow-2xl min-h-[450px]">
            <CardHeader className="border-b border-slate-800/60 bg-slate-900/60 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Hộp thư nhận được</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Chi tiết email và mã OTP trích xuất tự động.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Hệ thống sẵn sàng</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-6 overflow-y-auto">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-amber-500 animate-spin" />
                    <Mail className="h-6 w-6 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mb-1">Đang tải danh sách email</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Hệ thống đang gọi API kết nối đến máy chủ mail của Hotmail để lấy các tin nhắn mới nhất...</p>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
                    <span className="text-red-500 text-2xl font-black">!</span>
                  </div>
                  <h3 className="text-lg font-bold text-red-400 mb-2">Đã xảy ra lỗi</h3>
                  <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl max-w-md text-xs font-mono text-red-300 break-all mb-6">
                    {error}
                  </div>
                  <p className="text-sm text-slate-400 max-w-xs">
                    Vui lòng kiểm tra lại sự chính xác của Refresh Token, Client ID và đảm bảo tài khoản không bị khóa (locked).
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-6">
                    <Mail className="h-8 w-8 text-slate-700" />
                  </div>
                  <h3 className="text-base font-bold text-slate-400 mb-1">Chưa có dữ liệu email</h3>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">Điền cấu hình ở cột bên trái và nhấn nút "Quét hộp thư" để nhận danh sách thư và mã OTP.</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col">
                  {/* Selected OTP Highlight */}
                  {selectedOtpMessage && (
                    <div className="rounded-2xl border border-slate-800 bg-[#0f2333] p-6 text-slate-100 shadow-xl overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">
                            Mã xác nhận OTP phát hiện được
                          </div>
                          <h4 className="text-base font-bold text-white line-clamp-1">
                            {selectedOtpMessage.subject}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {selectedOtpMessage.date}
                          </p>
                        </div>

                        <div className="rounded-xl border border-sky-500/10 bg-[#0a1824] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-center sm:text-left">
                            <span className="text-[10px] font-bold text-sky-400/80 uppercase tracking-widest block mb-0.5">Verification Code</span>
                            <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-white select-all">
                              {selectedOtpMessage.otp}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleCopyOtp(selectedOtpMessage.otp)}
                            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold active:scale-95 transition-all shrink-0"
                          >
                            <Key className="h-4 w-4 mr-2" />
                            {copiedOtp === selectedOtpMessage.otp ? "Đã copy thành công!" : "SAO CHÉP MÃ"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mail List */}
                  <div className="space-y-2.5 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Danh sách thư mới nhận ({messages.length})</span>
                    <div className="space-y-2">
                      {messages.map((msg, idx) => {
                        const isSelected = msg.otp && selectedOtpMessage?.index === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (msg.otp) {
                                setSelectedOtpIndex(idx);
                              }
                            }}
                            className={`w-full rounded-xl border p-4 text-left transition-all duration-200 block ${
                              isSelected
                                ? "border-emerald-500/40 bg-emerald-500/[0.04] shadow-md shadow-emerald-500/5"
                                : "border-slate-800/80 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1 min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-200 truncate">{msg.subject}</h4>
                                <p className="text-xs text-slate-500">{msg.date}</p>
                              </div>
                              <div className="shrink-0 flex items-center">
                                {msg.otp ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-sm px-2.5 py-0.5">
                                    {msg.otp}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-slate-600 border-slate-800 text-[10px] py-0.5 font-normal">
                                    Không có OTP
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-600">
              <span>Hộp thư được xử lý an toàn thông qua API Server-to-Server.</span>
              <span className="font-mono text-[10px]">OTP-SERVICE v1.0</span>
            </div>
          </Card>
        </section>
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600 relative z-10 mt-auto">
        <p>© 2026 ChatGPT Reg-Tools. Developed for premium access utility.</p>
      </footer>
    </main>
  );
}
