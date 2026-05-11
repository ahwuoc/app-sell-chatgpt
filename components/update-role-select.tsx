"use client";

import { useState } from "react";
import { updateUserRoleAction } from "@/app/actions";
import { ShieldCheck, Check, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";

interface UpdateRoleSelectProps {
  username: string;
  currentRole: string;
}

export function UpdateRoleSelect({ username, currentRole }: UpdateRoleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState(currentRole);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    if (newRole !== currentRole) {
      setPendingRole(newRole);
      setIsOpen(true);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("role", pendingRole);
      await updateUserRoleAction(formData);
      setIsOpen(false);
    } catch (error) {
      console.error("Update failed", error);
      alert("Cập nhật thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const modal = isOpen ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-inner">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Xác nhận đổi quyền?</h3>
            <p className="text-sm text-slate-500">
              Bạn có chắc chắn muốn đổi quyền của <span className="font-bold text-slate-700">{username}</span> thành <span className="font-bold text-blue-600 uppercase">{pendingRole}</span>?
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
    <div className="flex flex-1 gap-2">
      <select
        value={pendingRole}
        onChange={handleChange}
        disabled={isLoading}
        className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium outline-none focus:ring-2 focus:ring-slate-100 cursor-pointer hover:bg-slate-50"
      >
        <option value="user">Người dùng (User)</option>
        <option value="admin">Quản trị viên (Admin)</option>
      </select>
      {modal}
    </div>
  );
}
