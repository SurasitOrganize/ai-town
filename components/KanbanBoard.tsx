"use client";

import { useStore } from '@/lib/store';

export function KanbanBoard() {
  const tasks = useStore((state) => state.tasks);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-red-500' },
    { id: 'doing', title: 'Doing', color: 'border-yellow-500' },
    { id: 'done', title: 'Done', color: 'border-green-500' },
  ];

  return (
    <div className="h-64 bg-gray-900 border-t border-gray-700 p-4">
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <h3 className={`text-white font-semibold mb-3 pb-2 border-b-2 ${column.color}`}>
              {column.title}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {tasks
                .filter((task) => task.status === column.id)
                .map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-800 p-3 rounded border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                  >
                    <p className="text-white font-medium text-sm">{task.title}</p>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {task.description}
                    </p>
                    {task.assignedTo && (
                      <div className="mt-2 flex items-center space-x-1">
                        <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                        <span className="text-xs text-gray-400">Assigned</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
