import { NextRequest, NextResponse } from "next/server";

/**
 * Web Share Target handler.
 *
 * When a user shares a link (e.g. a turn invitation from WhatsApp) to the
 * installed PWA, Android opens this route with the shared data as query
 * params. We extract the turn URL and redirect to it.
 *
 * The manifest declares this as a GET share_target with params: title, text,
 * url. Android passes the shared content as query string parameters.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sharedUrl = searchParams.get("url");
  const sharedText = searchParams.get("text") ?? "";

  // Try to extract a turn URL from the shared url or text.
  // Turn links look like /t/{uuid} or https://padelred.app/t/{uuid}
  const turnMatch = (sharedUrl + " " + sharedText).match(
    /(?:https?:\/\/[^/]+)?\/(t\/[a-zA-Z0-9-]+)/,
  );

  if (turnMatch) {
    return NextResponse.redirect(new URL(`/${turnMatch[1]}`, request.url));
  }

  // Try match links: /m/{matchId} or /j/{playerId}
  const matchMatch = (sharedUrl + " " + sharedText).match(
    /(?:https?:\/\/[^/]+)?\/(m\/[a-zA-Z0-9-]+|j\/[a-zA-Z0-9-]+)/,
  );

  if (matchMatch) {
    return NextResponse.redirect(new URL(`/${matchMatch[1]}`, request.url));
  }

  // No recognizable link — redirect to dashboard
  return NextResponse.redirect(new URL("/me", request.url));
}
