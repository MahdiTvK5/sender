import { NextResponse } from "next/server";
import { createConfig } from "@/lib/store";
import { validateConfig } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { getBaseUrlFromRequest } from "@/lib/request";
import type { CreateResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limit = rateLimit(`create:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "درخواست‌های بیش از حد. لطفاً کمی بعد تلاش کنید." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "بدنه درخواست نامعتبر است." }, { status: 400 });
  }

  const config = (body as { config?: unknown })?.config;
  const validation = validateConfig(config);
  if (!validation.ok || !validation.value) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    const baseUrl = getBaseUrlFromRequest(request.headers);
    const record = createConfig(validation.value, baseUrl);

    const payload: CreateResponse = {
      code: record.code,
      shareLink: record.shareLink,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    };

    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته رخ داد.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
