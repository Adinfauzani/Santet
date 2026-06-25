import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { providerId } = await req.json();
    if (providerId !== "google" && providerId !== "github") {
      return NextResponse.json({ error: "invalid provider" }, { status: 400 });
    }

    const result = await auth.api.unlinkAccount({
      body: { providerId },
      headers: req.headers,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || e?.body?.message || "Failed to unlink" },
      { status: 400 },
    );
  }
}
