'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

export default function Home() {
  const router = useRouter();

  function handleCreated() {
    router.refresh(); // atualiza imediatamente pra mostrar a task criada
  }

  // 🔁 Após criar, ouvir "tasks:refresh" e fazer polling do /api/tasks/:id
  useEffect(() => {
    function onRefresh(e: Event) {
      const id = (e as CustomEvent).detail?.id as string | number | undefined;
      if (!id) return;

      let active = true;
      const deadline = Date.now() + 20_000; // até 20s esperando o N8N
      const tick = async () => {
        if (!active) return;
        try {
          const res = await fetch(`/api/tasks/${id}`, { cache: 'no-store' });
          if (res.ok) {
            const row = await res.json();
            if (row?.enhanced_title) {
              router.refresh(); // agora o título enriquecido aparece
              active = false;
              return;
            }
          }
        } catch { /* silencioso */ }
        if (Date.now() < deadline) setTimeout(tick, 1200);
      };

      tick();
    }

    window.addEventListener('tasks:refresh', onRefresh as EventListener);
    return () => window.removeEventListener('tasks:refresh', onRefresh as EventListener);
  }, [router]);

  return (
    <main className="container mx-auto p-6">
      <TaskForm onAdd={handleCreated} />
      <TaskList />
    </main>
  );
}
