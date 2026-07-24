import { NextResponse } from "next/server";
import { deleteConfigByCode, getConfigByCode } from "@/lib/store";
import { isValidCode } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import type { PublicConfig } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`read:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "درخواست‌های بیش از حد. لطفاً کمی بعد تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { code } = await params;
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "کد نامعتبر است." }, { status: 400 });
  }

  const record = getConfigByCode(code);
  if (!record) {
    return NextResponse.json({ error: "کانفیگی پیدا نشد." }, { status: 404 });
  }

  if (record.status === "expired") {
    return NextResponse.json({ error: "این لینک منقضی شده است." }, { status: 410 });
  }

  const payload: PublicConfig = {
    config: record.config,
    code: record.code,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    status: record.status,
  };

  return NextResponse.json(payload, { status: 200 });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`delete:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "درخواست‌های بیش از حد. لطفاً کمی بعد تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { code } = await params;
  if (!isValidCode(code)) {
    return NextResponse.json({ error: "کد نامعتبر است." }, { status: 400 });
  }

  const removed = deleteConfigByCode(code);
  if (!removed) {
    return NextResponse.json({ error: "کانفیگی پیدا نشد." }, { status: 404 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
