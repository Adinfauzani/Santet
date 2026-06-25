import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { newPassword } = await req.json();
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const result = await auth.api.setPassword({
      body: { newPassword },
      headers: req.headers,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || e?.body?.message || "Failed to set password" },
      { status: 400 },
    );
  }
}
