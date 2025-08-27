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
