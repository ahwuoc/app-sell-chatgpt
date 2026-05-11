"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Upload, X, CheckCircle2, AlertCircle, Terminal } from "lucide-react";
import { bulkImportAccountsAction } from "@/app/actions";
import { SubmitButton } from "@/app/submit-button";
import { Button } from "@/components/ui/button";

export function ImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto p-4 py-6 sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative my-auto flex max-h-[min(88svh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-50 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-500 rounded-2xl shadow-lg shadow-blue-200">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nhập dữ liệu hàng loạt</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hỗ trợ định dạng pipe-separated (|)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          action={async (formData) => {
            await bulkImportAccountsAction(formData);
            setIsOpen(false);
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 space-y-6 overflow-y-auto px-8 py-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Dữ liệu thô
                </label>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                  EMAIL | PASS | TOKEN | ID
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Định dạng hỗ trợ
                </div>
                <div className="mt-2 space-y-1 font-mono text-xs leading-6 text-slate-600">
                  <div>EMAIL | PASSWORD | REFRESH_TOKEN | CLIENT_ID</div>
                  <div>EMAIL | PASSWORD | REFRESH_TOKEN | CLIENT_ID | MAILKP | PASSWORD_MAILKP</div>
                </div>
              </div>

              <textarea
                name="bulkData"
                rows={6}
                placeholder={`EMAIL | PASSWORD | REFRESH_TOKEN | CLIENT_ID\nEMAIL | PASSWORD | REFRESH_TOKEN | CLIENT_ID | MAILKP | PASSWORD_MAILKP`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed outline-none transition-all placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 resize-y"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed text-blue-600">
                  Hệ thống tự động lọc trùng email trong database.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed text-amber-700">
                  Mỗi tài khoản phải nằm trên một dòng riêng biệt.
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-50 px-8 py-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <SubmitButton className="min-w-[140px] rounded-xl bg-slate-900 py-2.5 text-white shadow-lg shadow-slate-200" />
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all"
      >
        <Upload className="h-4 w-4" />
        Import tai khoan
      </Button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
