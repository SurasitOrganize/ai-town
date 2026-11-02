"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { createLLMProvider, LLMMessage } from '@/lib/llm';

export function TaskPanel() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { selectedAgent, chatMessages, addChatMessage, isChatOpen } = useStore();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const llmProvider = createLLMProvider();
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: `You are ${selectedAgent?.name || 'an AI assistant'}, a ${selectedAgent?.role || 'helpful agent'} in a virtual office. Respond naturally and helpfully to task assignments and questions.`,
        },
        ...chatMessages.map((msg) => ({
          role: msg.sender === 'You' ? 'user' as const : 'assistant' as const,
          content: msg.content,
        })),
        {
          role: 'user',
          content: input,
        },
      ];

      const response = await llmProvider.chat(messages);
      
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        sender: selectedAgent?.name || 'Agent',
        content: response.content,
        timestamp: new Date(),
      };

      addChatMessage(agentMessage);
    } catch (error) {
      console.error('Error calling LLM:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: selectedAgent?.name || 'Agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      addChatMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen && !selectedAgent) {
    return (
      <div className="w-96 bg-gray-800 border-l border-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-400 p-8">
          <div className="text-4xl mb-4">💬</div>
          <p>Walk near an agent to chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">
          {selectedAgent ? `Chat with ${selectedAgent.name}` : 'Assign a Task'}
        </h2>
        {selectedAgent && (
          <p className="text-gray-400 text-sm">{selectedAgent.role}</p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            <p>Start a conversation...</p>
          </div>
        )}
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.sender === 'You' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                msg.sender === 'You'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              <p className="text-xs font-semibold mb-1 opacity-75">
                {msg.sender}
              </p>
              <p>{msg.content}</p>
              <p className="text-xs opacity-50 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-700 text-white">
              <p className="text-xs font-semibold mb-1 opacity-75">
                {selectedAgent?.name || 'Agent'}
              </p>
              <p>Typing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
