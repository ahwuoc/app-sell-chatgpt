"use client";

import { X } from "lucide-react";
import { deleteAccountAction } from "@/app/actions";
import { toast } from "sonner";

export function DeleteAccountButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?")) return;

    try {
      const formData = new FormData();
      formData.append("id", id);
      const result = await deleteAccountAction(formData);
      if (result?.success) {
        toast.success(result.message);
      } else {
        toast.error(result?.message || "Lỗi khi xóa tài khoản");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối máy chủ");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-50 text-red-400 transition-all hover:bg-red-50 hover:text-red-600 active:scale-90"
      title="Xóa tài khoản"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
