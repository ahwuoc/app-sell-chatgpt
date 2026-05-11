"use client";

import { useState } from "react";
import { updateBalanceAction } from "@/app/actions";
import { Wallet, AlertCircle, Check } from "lucide-react";
import { createPortal } from "react-dom";

interface UpdateBalanceFormProps {
  username: string;
  currentBalance: number;
}

export function UpdateBalanceForm({ username, currentBalance }: UpdateBalanceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<string>("");
  const [type, setType] = useState<string>("add");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("balance", amount);
      formData.append("type", type);
      await updateBalanceAction(formData);
      setIsOpen(false);
      setAmount("");
    } catch (error) {
      console.error("Update failed", error);
      alert("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return `${value.toLocaleString("vi-VN")} VND`;
  };

  const calculateNewBalance = () => {
    const val = parseInt(amount) || 0;
    if (type === "add") return currentBalance + val;
    if (type === "subtract") return Math.max(0, currentBalance - val);
    return val;
  };

  const modal = isOpen ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500 shadow-inner">
            <Wallet className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Xác nhận thay đổi số dư?</h3>
            <p className="text-sm text-slate-500">
              Bạn đang thực hiện <span className="font-bold text-slate-700">{type === 'add' ? 'Cộng' : type === 'subtract' ? 'Trừ' : 'Đặt'}</span> số tiền <span className="font-bold text-slate-700">{formatPrice(parseInt(amount) || 0)}</span> cho <span className="font-bold text-slate-700">{username}</span>.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Số dư hiện tại</span>
                <span>{formatPrice(currentBalance)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Số dư sau khi lưu</span>
                <span className="text-emerald-600">{formatPrice(calculateNewBalance())}</span>
              </div>
            </div>
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
    <form onSubmit={handleSubmit} className="flex gap-1">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-1 text-[10px] font-bold outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer"
      >
        <option value="add">Cộng (+)</option>
        <option value="subtract">Trừ (-)</option>
        <option value="set">Đặt (Set)</option>
      </select>
      <div className="relative flex-1">
        <Wallet className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Số tiền..."
          className="h-8 w-full rounded-lg border border-slate-200 pl-8 pr-2 text-[11px] outline-none transition-all focus:ring-2 focus:ring-slate-100 bg-white"
          required
        />
      </div>
      <button
        type="submit"
        disabled={!amount || isLoading}
        className="h-8 rounded-lg bg-slate-900 px-3 text-[10px] font-bold text-white transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-50"
      >
        Lưu
      </button>
      {modal}
    </form>
  );
}
