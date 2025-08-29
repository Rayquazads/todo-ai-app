'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'To-Do AI App';

export default function Home() {
  const router = useRouter();

  function handleCreated() {
    router.refresh();
  }

  useEffect(() => {
    function onRefresh(e: Event) {
      const id = (e as CustomEvent).detail?.id as string | number | undefined;
      if (!id) return;

      let active = true;
      const deadline = Date.now() + 20_000;
      const tick = async () => {
        if (!active) return;
        try {
          const res = await fetch(`/api/tasks/${id}`, { cache: 'no-store' });
          if (res.ok) {
            const row = await res.json();
            if (row?.enhanced_title) {
              router.refresh();
              active = false;
              return;
            }
          }
        } catch {}
        if (Date.now() < deadline) setTimeout(tick, 1200);
      };
      tick();
    }

    window.addEventListener('tasks:refresh', onRefresh as EventListener);
    return () => window.removeEventListener('tasks:refresh', onRefresh as EventListener);
  }, [router]);

  return (
    <main className="container mx-auto p-6">
      {/* ✅ título restaurado no topo, sem mudar o restante */}
      <h1 className="text-2xl font-semibold mb-4">{APP_NAME}</h1>

      <TaskForm onAdd={handleCreated} />
      <TaskList />
    </main>
  );
}
