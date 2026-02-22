"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app_global_error]", error);

  return (
    <html lang="en">
      <body className="bg-slate-100 p-8">
        <div className="mx-auto mt-16 max-w-xl rounded-xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">A critical error occurred</h2>
          <p className="mt-2 text-sm text-slate-600">Please retry or restart the app server.</p>
          <button
            onClick={() => reset()}
            className="mt-5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
