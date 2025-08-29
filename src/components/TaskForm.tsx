<<<<<<< HEAD
'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TaskForm({ onAdd }: { onAdd: () => void }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function addTask() {
    if (!title.trim()) return;
    setLoading(true);

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, user_email: 'gabriel@test.dev' })
    });

    setTitle('');
    setLoading(false);
    onAdd(); // notifica lista para recarregar
  }
=======
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

type CreatedTask = { id: number | string; title: string };

export default function TaskForm({ onAdd }: { onAdd: () => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function addTask() {
  if (!title.trim()) return;
  setLoading(true);

  try {
    // cria a task na sua API
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, user_email: "gabriel@test.dev" }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("POST /api/tasks falhou:", res.status, text);
      throw new Error("Falha ao criar a task");
    }

    const created = await res.json(); // { id, title }

    // dispara o n8n (via proxy). Não bloqueia a UI.
    fetch("/api/n8n/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: created.id, title: created.title }),
      keepalive: true,
    }).catch(console.warn);

    setTitle("");
    onAdd?.();

    // opcional: evento para refetch leve na lista
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tasks:refresh", { detail: { id: created.id } }));
    }
  } catch (e) {
    alert("Não foi possível criar a task.");
    console.error(e);
  } finally {
    setLoading(false);
  }
}

>>>>>>> e721d49 (feat: integrate n8n AI suggestions with Supabase updates and UI polling)

  return (
    <div className="flex gap-2">
      <input
        className="border rounded px-3 py-2 flex-1"
        placeholder="New task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        onClick={addTask}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white disabled:opacity-50 cursor-pointer"
        aria-label="Add task"
        title="Add task"
      >
        {loading ? "..." : (<><Plus size={16} /> Add</>)}
      </button>
    </div>
  );
}
