"use client";

import { useState } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { agentRepository } from '@/lib/repository/supabase';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAgentModal({ isOpen, onClose }: AddAgentModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTools = [
    { id: 'web_search', label: 'Web Search' },
    { id: 'slack', label: 'Slack' },
  ];

  const avatars = ['👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼', '🤖', '🦾', '🧠'];

  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !role.trim()) {
      setError('Name and role are required');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find an available desk position (simple logic for now)
      const deskX = Math.floor(Math.random() * 5) * 100 + 200;
      const deskY = Math.floor(Math.random() * 2) * 150 + 200;

      await agentRepository.create({
        name: name.trim(),
        role: role.trim(),
        status: 'online',
        taskStatus: 'idle',
        x: deskX,
        y: deskY,
        avatar: selectedAvatar,
      });

      // Reset form
      setName('');
      setRole('');
      setSelectedTools([]);
      setSelectedAvatar(avatars[0]);
      
      onClose();
    } catch (err: any) {
      console.error('Failed to create agent:', err);
      setError(err.message || 'Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId)
        ? prev.filter((id) => id !== toolId)
        : [...prev, toolId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add New Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Agent name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Role *
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., Frontend Developer"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded transition-colors ${
                    selectedAvatar === avatar
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  disabled={isSubmitting}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Allowed Tools
            </label>
            <div className="space-y-2">
              {availableTools.map((tool) => (
                <label
                  key={tool.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTools.includes(tool.id)}
                    onChange={() => toggleTool(tool.id)}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600"
                    disabled={isSubmitting}
                  />
                  <span className="text-gray-300">{tool.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700 disabled:opacity-50 text-white py-2 px-4 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
