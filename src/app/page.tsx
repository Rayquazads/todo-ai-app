'use client';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

export default function Home() {
  const router = useRouter();
  function handleCreated() { router.refresh(); } // mantém visual igual

  return (
    <main className="container mx-auto p-6">
      <TaskForm onAdd={handleCreated} />
      <TaskList />
    </main>
  );
}
