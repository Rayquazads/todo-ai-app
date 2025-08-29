import { NextResponse } from "next/server";
import crypto from "crypto";

const url = process.env.N8N_WEBHOOK_URL!;
const secret = process.env.N8N_SIGNING_SECRET || "";

function sign(body: string) {
  return secret ? crypto.createHmac("sha256", secret).update(body).digest("hex") : "";
}

interface EnhanceRequest {
  id: string;
  title: string;
}

export async function POST(req: Request) {
  try {
    const parsed = (await req.json()) as Partial<EnhanceRequest>;
    const id = typeof parsed.id === "string" ? parsed.id : undefined;
    const title = typeof parsed.title === "string" ? parsed.title : undefined;

    if (!id || !title) {
      return NextResponse.json({ ok: false, error: "id e title são obrigatórios" }, { status: 400 });
    }

    const body = JSON.stringify({ id, title, idempotencyKey: String(id) });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["X-Signature"] = sign(body);

    // retry simples (3 tentativas)
    for (let attempt = 1; attempt <= 3; attempt++) {
      const r = await fetch(url, {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      });
      if (r.ok) return NextResponse.json({ ok: true });
      await new Promise((res) => setTimeout(res, attempt * 400));
    }

    return NextResponse.json({ ok: false, error: "Webhook indisponível" }, { status: 502 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("POST /api/n8n/enhance error:", e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
