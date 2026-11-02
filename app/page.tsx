"use client";

import { TeamSidebar } from "@/components/TeamSidebar";
import { OfficeCanvas } from "@/components/OfficeCanvas";
import { TaskPanel } from "@/components/TaskPanel";
import { KanbanBoard } from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-900">
      {/* Left Sidebar */}
      <TeamSidebar />
      
      {/* Center Office Canvas */}
      <div className="flex-1 flex flex-col">
        <OfficeCanvas />
        
        {/* Bottom Kanban Board */}
        <KanbanBoard />
      </div>
      
      {/* Right Task Panel */}
      <TaskPanel />
    </div>
  );
}
