import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

<<<<<<< HEAD
type TaskInsert = { title: string; user_email: string; source?: string };

// GET /api/tasks
=======
>>>>>>> e721d49 (feat: integrate n8n AI suggestions with Supabase updates and UI polling)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
<<<<<<< HEAD
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
=======
    .order("id", { ascending: false });

  if (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? [], { status: 200 });
}

export async function POST(req: Request) {
  try {
    const { title, user_email } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "title obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert([{ title, user_email, completed: false, source: "user" }])
      .select("id, title")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // >>> devolve id + title para o form poder chamar o webhook
    return NextResponse.json({ id: data!.id, title: data!.title }, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/tasks exception:", e);
    return NextResponse.json({ error: e.message ?? "unknown" }, { status: 500 });
>>>>>>> e721d49 (feat: integrate n8n AI suggestions with Supabase updates and UI polling)
  }
}
