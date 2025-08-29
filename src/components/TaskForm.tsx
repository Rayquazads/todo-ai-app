"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

type CreatedTask = { id: number | string; title: string };

export default function TaskForm({ onAdd }: { onAdd?: () => void }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function addTask() {
    if (!title.trim()) return;
    setLoading(true);

    try {
      // 1) cria a task
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

      const created: CreatedTask = await res.json();

      // 2) dispara o webhook pro n8n (via proxy server-side)
      fetch("/api/n8n/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: created.id, title: created.title }),
        keepalive: true,
      }).catch(console.warn);

      setTitle("");
      setLoading(false);
      onAdd?.();

      // evento para a lista iniciar o polling leve
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tasks:refresh", { detail: { id: created.id } })
        );
      }
    } catch (e) {
      setLoading(false);
      alert("Não foi possível criar a task.");
      console.error(e);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        className="border border-zinc-700 bg-transparent rounded px-3 py-2 flex-1 outline-none"
        placeholder="New task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button
        onClick={addTask}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white disabled:opacity-50 cursor-pointer border border-zinc-800"
        aria-label="Add task"
        title="Add task"
      >
        {loading ? "..." : (
          <>
            <Plus size={16} /> Add
          </>
        )}
      </button>
    </div>
  );
}
