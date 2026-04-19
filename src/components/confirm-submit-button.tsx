"use client";

import React from "react";

interface ConfirmSubmitButtonProps {
  children: React.ReactNode;
  confirmMessage?: string;
  className?: string;
  title?: string;
}

export default function ConfirmSubmitButton({ children, confirmMessage = "Are you sure?", className, title }: ConfirmSubmitButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirm(confirmMessage)) {
      const btn = e.currentTarget as HTMLButtonElement;
      const form = btn.closest("form") as HTMLFormElement | null;
      if (form) form.submit();
    }
  };

  return (
    <button type="button" title={title} className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
