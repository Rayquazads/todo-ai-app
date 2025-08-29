import { NextResponse } from "next/server";
import crypto from "crypto";

const url = process.env.N8N_WEBHOOK_URL; // sem '!' para podermos validar
const secret = process.env.N8N_SIGNING_SECRET || "";

function sign(body: string) {
  return secret ? crypto.createHmac("sha256", secret).update(body).digest("hex") : "";
}

interface EnhanceRequest {
  id: string | number;
  title: string;
}

export async function POST(req: Request) {
  try {
    if (!url) {
      // ajuda a diagnosticar no Vercel
      console.error("ENHANCE: N8N_WEBHOOK_URL não definido");
      return NextResponse.json({ ok: false, error: "N8N_WEBHOOK_URL não configurado" }, { status: 500 });
    }

    const payload = (await req.json()) as Partial<EnhanceRequest>;
    const id = typeof payload.id === "string" || typeof payload.id === "number" ? String(payload.id) : "";
    const title = typeof payload.title === "string" ? payload.title : "";

    if (!id || !title) {
      return NextResponse.json({ ok: false, error: "id e title são obrigatórios" }, { status: 400 });
    }

    const body = JSON.stringify({ id, title, idempotencyKey: id });
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["X-Signature"] = sign(body);

    // retry simples
    for (let attempt = 1; attempt <= 3; attempt++) {
      const r = await fetch(url, { method: "POST", headers, body, cache: "no-store", keepalive: true });
      if (r.ok) {
        // opcional: ecoa um OK detalhado p/ debugar no Network
        return NextResponse.json({ ok: true, forwarded: true }, { status: 200 });
      }
      const text = await r.text();
      console.warn(`ENHANCE tentativa ${attempt} falhou:`, r.status, text);
      await new Promise((res) => setTimeout(res, attempt * 400));
    }

    return NextResponse.json({ ok: false, error: "Webhook indisponível (N8N)" }, { status: 502 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("POST /api/n8n/enhance error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
