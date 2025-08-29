import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

<<<<<<< HEAD
type TaskUpdate = { title?: string; completed?: boolean };

// PATCH /api/tasks/:id
export async function PATCH(req: Request, context: unknown) {
  try {
    const { params } = context as { params: { id: string } };
    const id = params.id;

    const body = (await req.json()) as TaskUpdate;

    const updates: TaskUpdate = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.completed !== undefined) updates.completed = body.completed;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data?.[0] ?? null, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// DELETE /api/tasks/:id
export async function DELETE(_req: Request, context: unknown) {
  try {
    const { params } = context as { params: { id: string } };
    const id = params.id;

    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
=======
type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  const id = params.id;
  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function PATCH(req: Request, { params }: Params) {
  const id = params.id;
  const body = await req.json();

  const fields: Record<string, any> = {};
  if (typeof body.title === "string") fields.title = body.title;
  if (typeof body.completed === "boolean") fields.completed = body.completed;

  if (!Object.keys(fields).length) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("tasks")
    .update(fields)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = params.id;
  const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 200 });
>>>>>>> e721d49 (feat: integrate n8n AI suggestions with Supabase updates and UI polling)
}
