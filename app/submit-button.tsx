"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({
  children,
  className,
  variant,
  size,
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      size={size}
      className={className ?? "w-full sm:w-auto"}
    >
      {pending ? "Dang luu..." : (children ?? "Luu tai khoan")}
    </Button>
  );
}
