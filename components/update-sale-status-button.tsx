"use client";

import { useState } from "react";
import { updateAccountSaleStatusAction } from "@/app/actions";
import { AlertCircle, Check, X, Eye, EyeOff } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { AccountSaleStatus } from "@/types/account";

interface UpdateSaleStatusButtonProps {
  id: string;
  currentSaleStatus: AccountSaleStatus;
  email: string;
}

export function UpdateSaleStatusButton({ id, currentSaleStatus, email }: UpdateSaleStatusButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const nextStatus = currentSaleStatus === 'available' ? 'reserved' : 'available';

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("saleStatus", nextStatus);
      const result = await updateAccountSaleStatusAction(formData);
      if (result?.success) {
        toast.success(result.message);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Update failed", error);
      alert("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const modal = isOpen ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCancel} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${currentSaleStatus === 'available' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'} shadow-inner`}>
            {currentSaleStatus === 'available' ? <EyeOff className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">
              {currentSaleStatus === 'available' ? 'Ngừng đăng bán?' : 'Bật đăng bán lại?'}
            </h3>
            <p className="text-sm text-slate-500">
              Bạn có chắc chắn muốn {currentSaleStatus === 'available' ? 'tạm ngừng' : 'bật'} đăng bán cho tài khoản <span className="font-bold text-slate-700">{email}</span>?
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 h-12 rounded-xl ${currentSaleStatus === 'available' ? 'bg-amber-500' : 'bg-emerald-500'} text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4" />
                Xác nhận
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
        disabled={isLoading}
        className={`text-[10px] font-bold underline decoration-dotted underline-offset-4 transition-all hover:decoration-solid ${currentSaleStatus === 'available'
          ? 'text-amber-600 hover:text-amber-700'
          : 'text-emerald-600 hover:text-emerald-700'
          }`}
      >
        {currentSaleStatus === 'available' ? 'Tạm ngừng bán' : 'Mở bán ngay'}
      </button>
      {modal}
    </>
  );
}
