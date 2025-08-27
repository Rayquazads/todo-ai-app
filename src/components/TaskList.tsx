'use client';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

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
            />
          )}

          {/* botão deletar */}
          <button
            onClick={() => deleteTask(t.id)}
            aria-label={`Delete task "${t.title}"`}
            className="px-2 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600 transition"
          >
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
