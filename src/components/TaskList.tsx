<<<<<<< HEAD
'use client';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Trash2 } from 'lucide-react';

type Task = { id: number; title: string; enhanced_title: string | null; completed: boolean };

export type TaskListRef = {
  loadTasks: () => void;
};

const TaskList = forwardRef<TaskListRef>((_props, ref) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  }

  async function toggleTask(id: number, completed: boolean) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    loadTasks();
  }

  async function updateTitle(id: number, title: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    loadTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  }

  useImperativeHandle(ref, () => ({ loadTasks }));

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ul className="mt-4 space-y-2">
      {tasks.map((t) => (
        <li key={t.id} className="border rounded p-3 flex items-center gap-3">
          {/* checkbox → atualiza completed */}
          <input
            type="checkbox"
            checked={t.completed}
            onChange={(e) => toggleTask(t.id, e.target.checked)}
            className="cursor-pointer"
            aria-label={`Mark task "${t.title}" as ${t.completed ? 'incomplete' : 'complete'}`}
            title={t.completed ? 'Mark as incomplete' : 'Mark as complete'}
          />

          {/* título (span riscado se completed, input editável se não) */}
          {t.completed ? (
            <span className="flex-1 line-through text-gray-400">{t.title}</span>
          ) : (
            <input
              defaultValue={t.title}
              onBlur={(e) => updateTitle(t.id, e.target.value)}
              className="flex-1 outline-none"
              aria-label={`Edit title for task "${t.title}"`}
              title="Click outside to save"
            />
          )}

          {/* botão deletar */}
          <button
            onClick={() => deleteTask(t.id)}
            aria-label={`Delete task "${t.title}"`}
            title="Delete task"
            className="flex items-center gap-1 px-2 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600 transition cursor-pointer"
          >
            <Trash2 size={16} />
            Delete
          </button>

          {/* título melhorado (IA) */}
          {t.enhanced_title && (
            <span className="text-sm italic opacity-70">→ {t.enhanced_title}</span>
          )}
        </li>
      ))}
    </ul>
  );
});

TaskList.displayName = 'TaskList';
export default TaskList;
=======
"use client";

import { useEffect, useRef, useState } from "react";

type Task = {
  id: number | string;
  title: string;
  enhanced_title: string | null;
  completed: boolean;
};

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const loadedRef = useRef(false);

  async function loadAll() {
    const res = await fetch("/api/tasks", { cache: "no-store" });
    if (!res.ok) return;
    const data: Task[] = await res.json();
    setTasks(data);
  }

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadAll();
  }, []);

  // ====== Ações ======
  async function toggleComplete(t: Task) {
    await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !t.completed }),
    });
    await loadAll();
  }

  function beginEdit(t: Task) {
    setEditingId(t.id);
    setEditingTitle(t.title);
  }

  async function commitEdit() {
    if (!editingId) return;
    const title = editingTitle.trim();
    if (!title) {
      setEditingId(null);
      return;
    }
    await fetch(`/api/tasks/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setEditingId(null);
    setEditingTitle("");
    await loadAll();
  }

  async function deleteTask(id: number | string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await loadAll();
  }

  // ====== Polling curto após criação para capturar enhanced_title ======
  useEffect(() => {
    function onRefresh(e: Event) {
      const id = (e as CustomEvent).detail?.id as number | string | undefined;
      if (!id) return;

      let tries = 0;
      const maxTries = 10;
      const intervalMs = 800;

      const tick = async () => {
        tries++;
        try {
          const res = await fetch(`/api/tasks/${id}`, { cache: "no-store" });
          if (res.ok) {
            const t: Task = await res.json();
            if (t?.enhanced_title) {
              await loadAll();
              return;
            }
          }
        } catch {}
        if (tries < maxTries) setTimeout(tick, intervalMs);
      };

      setTimeout(tick, 600);
    }

    window.addEventListener("tasks:refresh", onRefresh);
    return () => window.removeEventListener("tasks:refresh", onRefresh);
  }, []);

  if (!tasks.length) return null;

  return (
    <ul className="mt-2 space-y-3">
      {tasks.map((t) => {
        const isEditing = editingId === t.id;
        return (
          <li
            key={t.id}
            className="border border-zinc-800 rounded-lg px-4 py-3 bg-zinc-900/40"
          >
            <div className="flex items-center gap-3">
              {/* checkbox */}
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleComplete(t)}
              />

              {/* título (edita ao clicar) */}
              {isEditing ? (
                <input
                  autoFocus
                  className="flex-1 bg-transparent border border-zinc-700 rounded px-2 py-1 outline-none"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") {
                      setEditingId(null);
                      setEditingTitle("");
                    }
                  }}
                />
              ) : (
                <button
                  className={`flex-1 text-left ${
                    t.completed ? "line-through text-zinc-500" : ""
                  }`}
                  onClick={() => beginEdit(t)}
                  title="Editar título"
                >
                  {t.title}
                </button>
              )}

              {/* botão deletar */}
              <button
                onClick={() => deleteTask(t.id)}
                className="px-3 py-1 rounded bg-red-600 text-white"
                title="Delete"
              >
                🗑️ Delete
              </button>

              {/* enhanced */}
              {t.enhanced_title && (
                <span className="ml-2 text-sm italic text-zinc-400 whitespace-nowrap">
                  → {t.enhanced_title}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
>>>>>>> e721d49 (feat: integrate n8n AI suggestions with Supabase updates and UI polling)
