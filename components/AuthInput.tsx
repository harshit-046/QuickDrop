"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, errorMessage, startContent, endContent, className, id, ...props },
  ref,
) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>

      <span
        className={`flex min-h-14 items-center rounded-2xl border border-gray-200/80 bg-[rgba(255,250,240,0.96)] px-4 shadow-sm transition focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-300/70 ${
          errorMessage ? "border-red-300/80 focus-within:border-red-300 focus-within:ring-red-200/70" : ""
        }`}
      >
        {startContent ? (
          <span className="mr-4 flex h-5 w-5 flex-shrink-0 items-center justify-center text-default-400">
            {startContent}
          </span>
        ) : null}

        <input
          ref={ref}
          id={id}
          className={`h-full min-w-0 flex-1 border-none bg-transparent py-3 text-[15px] text-[var(--foreground)] outline-none placeholder:text-default-400 ${className ?? ""}`}
          {...props}
        />

        {endContent ? (
          <span className="ml-4 flex flex-shrink-0 items-center justify-center">
            {endContent}
          </span>
        ) : null}
      </span>

      {errorMessage ? <span className="text-sm text-red-600">{errorMessage}</span> : null}
    </label>
  );
});

export default AuthInput;
