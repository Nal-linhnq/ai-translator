import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const authHeader = req.headers.get("authorization");

  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;
  const expectedAuth =
    "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  if (authHeader !== expectedAuth) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Protected"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
