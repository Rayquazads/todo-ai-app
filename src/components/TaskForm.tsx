'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TaskForm({ userEmail = 'gabriel@test.dev' }: { userEmail?: string }) {
  const [title, setTitle] = useState('');
  async function addTask() {
    if (!title.trim()) return;
    await supabase.from('tasks').insert({ title, user_email: userEmail });
    setTitle('');
    location.reload(); // simples por hoje; refinamos amanhã
  }
  return (
    <div className="flex gap-2">
      <input className="border rounded px-3 py-2 flex-1" placeholder="Nova tarefa..."
             value={title} onChange={(e)=>setTitle(e.target.value)} />
      <button onClick={addTask} className="px-4 py-2 rounded bg-black text-white">Adicionar</button>
    </div>
  );
}
