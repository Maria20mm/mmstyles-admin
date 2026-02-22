import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const GET = async () => {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let id = 0;

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(
            `id: ${++id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`
          )
        );
      };

      send("connected", { ok: true });

      const interval = setInterval(() => {
        send("tick", { at: new Date().toISOString() });
      }, 5000);

      return () => {
        clearInterval(interval);
      };
    },
    cancel() {
      // noop: interval cleanup is handled by the function returned in start
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};

export const dynamic = "force-dynamic";
