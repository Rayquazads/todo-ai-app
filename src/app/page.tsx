import { useRef } from 'react';
import TaskForm from '@/components/TaskForm';
import TaskList, { TaskListRef } from '@/components/TaskList';

export default function Home() {
  const listRef = useRef<TaskListRef>(null);

  function handleRefresh() {
    listRef.current?.loadTasks();
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">To-Do AI</h1>
      <TaskForm onAdd={handleRefresh} />
      <TaskList ref={listRef} />
    </main>
  );
}
