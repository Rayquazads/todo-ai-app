'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Task = { id:number; title:string; enhanced_title:string|null; completed:boolean };

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    supabase.from('tasks').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setTasks(data || []));
  }, []);

  async function toggle(id:number, completed:boolean){
    await supabase.from('tasks').update({ completed }).eq('id', id);
    location.reload();
  }
  async function updateTitle(id:number, title:string){
    await supabase.from('tasks').update({ title }).eq('id', id);
  }

  return (
    <ul className="mt-4 space-y-2">
      {tasks.map(t => (
        <li key={t.id} className="border rounded p-3 flex items-center gap-3">
          <input type="checkbox" checked={t.completed} onChange={e=>toggle(t.id, e.target.checked)} />
          <input defaultValue={t.title} onBlur={(e)=>updateTitle(t.id, e.target.value)} className="flex-1 outline-none" />
          {t.enhanced_title && <span className="text-sm italic opacity-70">→ {t.enhanced_title}</span>}
        </li>
      ))}
    </ul>
  );
}
