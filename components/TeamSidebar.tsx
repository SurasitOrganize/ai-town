"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { AddAgentModal } from './AddAgentModal';
import { SignOutButton } from './SignOutButton';

export function TeamSidebar() {
  const agents = useStore((state) => state.agents);
  const selectAgent = useStore((state) => state.selectAgent);
  const toggleChat = useStore((state) => state.toggleChat);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const handleAgentClick = (agent: any) => {
    selectAgent(agent);
    toggleChat(true);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <>
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Team</h2>
      </div>

      {/* Team List */}
      <div className="flex-1 overflow-y-auto">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => handleAgentClick(agent)}
            className="p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{agent.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-white font-medium truncate">{agent.name}</p>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                </div>
                <p className="text-gray-400 text-sm truncate">{agent.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Agent Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
        >
          + Add Agent
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left text-white hover:bg-gray-700 py-2 px-3 rounded text-sm transition-colors">
            📊 View Analytics
          </button>
          <button className="w-full text-left text-white hover:bg-gray-700 py-2 px-3 rounded text-sm transition-colors">
            ⚙️ Settings
          </button>
          <SignOutButton />
        </div>
      </div>
    </div>

    <AddAgentModal
      isOpen={isAddModalOpen}
      onClose={() => setIsAddModalOpen(false)}
    />
  </>
  );
}
