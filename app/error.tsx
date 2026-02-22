"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app_error]", error);
  }, [error]);

  return (
    <div className="mx-auto mt-16 max-w-xl rounded-xl border bg-white p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-slate-600">Please try again.</p>
      <button
        onClick={() => reset()}
        className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Retry
      </button>
    </div>
  );
}
