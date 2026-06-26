import { NextResponse, type NextRequest } from "next/server";

function basicAuthEnabled() {
  return Boolean(process.env.APP_BASIC_AUTH_USER && process.env.APP_BASIC_AUTH_PASSWORD);
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Delegate Kit", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function decodeBasicAuth(value: string) {
  const token = value.replace(/^Basic\s+/i, "");
  const decoded = atob(token);
  const separator = decoded.indexOf(":");
  return separator === -1
    ? { username: decoded, password: "" }
    : { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}

export function proxy(request: NextRequest) {
  if (!basicAuthEnabled()) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) {
    return unauthorized();
  }

  try {
    const credentials = decodeBasicAuth(header);
    if (
      credentials.username === process.env.APP_BASIC_AUTH_USER &&
      credentials.password === process.env.APP_BASIC_AUTH_PASSWORD
    ) {
      return NextResponse.next();
    }
  } catch {
    return unauthorized();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
