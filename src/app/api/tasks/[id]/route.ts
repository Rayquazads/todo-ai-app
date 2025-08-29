import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Params {
  params: { id: string };
}

interface UpdateTaskBody {
  title?: string;
  completed?: boolean;
}

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
  const raw = (await req.json()) as Partial<UpdateTaskBody>;

  const fields: Partial<{ title: string; completed: boolean }> = {};
  if (typeof raw.title === "string") fields.title = raw.title;
  if (typeof raw.completed === "boolean") fields.completed = raw.completed;

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
}
