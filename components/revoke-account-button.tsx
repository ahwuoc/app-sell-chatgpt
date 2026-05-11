"use client";

import { useState } from "react";
import { revokeAccountAction } from "@/app/actions";
import { RotateCcw, AlertCircle, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface RevokeAccountButtonProps {
  id: string;
  email: string;
}

export function RevokeAccountButton({ id, email }: RevokeAccountButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      const result = await revokeAccountAction(formData);
      if (result?.success) {
        toast.success(result.message);
        setIsOpen(false);
      } else {
        toast.error(result?.message || "Lỗi khi thu hồi tài khoản");
      }
    } catch (error) {
      console.error("Revoke failed", error);
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const modal = isOpen ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-inner">
            <RotateCcw className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Xác nhận thu hồi tài khoản?</h3>
            <p className="text-sm text-slate-500">
              Tài khoản <span className="font-bold text-slate-700">{email}</span> sẽ được chuyển từ trạng thái <span className="font-bold text-red-600">Đã bán</span> về <span className="font-bold text-emerald-600">Đang bán</span>.
              Mọi thông tin đơn hàng cũ sẽ bị gỡ bỏ và <span className="font-bold text-emerald-600">số tiền sẽ được hoàn tự động</span> cho người mua.
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg shadow-slate-200 transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Xác nhận thu hồi
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-amber-50 text-amber-600 text-[10px] font-bold hover:bg-amber-100 transition-all"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Thu hồi nick
      </button>
      {modal}
    </>
  );
}
