import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TaskInsert = { title: string; user_email: string; source?: string };

// GET /api/tasks
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

// POST /api/tasks
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TaskInsert;
    const { title, user_email } = body;
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert([{ title, user_email, source: "api" }])
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] ?? null, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
