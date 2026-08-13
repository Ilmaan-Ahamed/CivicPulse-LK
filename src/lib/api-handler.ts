import { NextResponse } from "next/server";

type RouteHandler = (req: Request, ...args: any[]) => Promise<Response>;

/**
 * Wraps an API route handler so that ANY thrown error — Prisma errors,
 * bugs, missing env vars, whatever — is always caught and returned as
 * JSON, never as Next.js's default HTML error page.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error(`[API ERROR] ${req.method} ${req.url}:`, error);

      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";

      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  };
}