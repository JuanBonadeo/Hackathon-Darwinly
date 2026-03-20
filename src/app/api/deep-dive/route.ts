import { NextResponse } from "next/server";
import { deepDiveAction } from "@/app/actions/deepDive";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  try {
    const report = await deepDiveAction(query);
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[DeepDive] Route error", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
