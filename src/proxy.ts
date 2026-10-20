import { NextResponse, type NextRequest } from "next/server";
import { canIndexHost, noIndexHeader } from "./lib/site-policy";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  if (!canIndexHost(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", noIndexHeader);
  }
  return response;
}

export const config = { matcher: "/:path*" };
