"use client";

import { X } from "lucide-react";
import { deleteUserAction } from "@/app/actions";
import { toast } from "sonner";

export function DeleteUserButton({ username }: { username: string }) {
  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng ${username}?`)) return;

    try {
      const formData = new FormData();
      formData.append("username", username);
      const result = await deleteUserAction(formData);
      if (result?.success) {
        toast.success(result.message);
      } else if (result?.message) {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi xóa người dùng");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
