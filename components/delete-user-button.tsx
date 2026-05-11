"use client";

import { X } from "lucide-react";
import { deleteUserAction } from "@/app/actions";

export function DeleteUserButton({ username }: { username: string }) {
  return (
    <form action={deleteUserAction}>
      <input type="hidden" name="username" value={username} />
      <button
        type="submit"
        onClick={(event) => {
          if (!confirm(`Bạn có chắc chắn muốn xóa người dùng ${username}?`)) {
            event.preventDefault();
          }
        }}
        className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors border border-red-100"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
