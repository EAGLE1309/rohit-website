import { NextResponse } from "next/server";

export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function devOnlyResponse() {
  return NextResponse.json(
    { success: false, error: "This endpoint is only available in development" },
    { status: 403 }
  );
}
