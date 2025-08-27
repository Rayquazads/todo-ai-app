'use client';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

type Task = { id:number; title:string; enhanced_title:string|null; completed:boolean };

export type TaskListRef = {
  loadTasks: () => void;
};

const TaskList = forwardRef<TaskListRef>((props, ref) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  async function loadTasks() {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
  }

  useImperativeHandle(ref, () => ({ loadTasks }));

  useEffect(() => { loadTasks(); }, []);

  return (
    <ul className="mt-4 space-y-2">
      {tasks.map(t => (
        <li key={t.id} className="border rounded p-3 flex items-center gap-3">
          {/* checkbox */}
          <input type="checkbox" checked={t.completed} readOnly />

          {/* título */}
          <span>{t.title}</span>

          {/* botão deletar */}
          <button
            onClick={() => deleteTask(t.id)}
            className="px-2 py-1 rounded bg-red-500 text-white text-sm"
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
