import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TaskInsert = { title: string; user_email: string; source?: string };

// GET /api/tasks
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? [], { status: 200 });
}

// POST /api/tasks
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TaskInsert;
    if (!body?.title || !body?.user_email) {
      return NextResponse.json(
        { error: "title e user_email são obrigatórios" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert({
        title: body.title,
        user_email: body.user_email,
        source: body.source ?? "user",
      })
      .select("*")
      .limit(1);

    if (error) {
      console.error("POST /api/tasks error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] ?? null, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
