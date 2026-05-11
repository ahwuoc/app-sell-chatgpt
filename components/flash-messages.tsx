"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";

function FlashMessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success) {
      toast.success(decodeURIComponent(success));
      // Remove the param from the URL without refreshing
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      const query = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${query}`);
    }

    if (error) {
      toast.error(decodeURIComponent(error));
      // Remove the param from the URL without refreshing
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const query = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${pathname}${query}`);
    }
  }, [searchParams, router, pathname]);

  return null;
}

export function FlashMessages() {
  return (
    <Suspense fallback={null}>
      <FlashMessagesContent />
    </Suspense>
  );
}
