import { Agent, Task, ChatMessage } from '../store';
import { AgentRepository, TaskRepository, ChatRepository } from './types';

// In-memory implementation - can be swapped with DB implementation later
class InMemoryAgentRepository implements AgentRepository {
  private agents: Map<string, Agent> = new Map();
  private nextId = 1;

  async getAll(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getById(id: string): Promise<Agent | null> {
    return this.agents.get(id) || null;
  }

  async create(agent: Omit<Agent, 'id'>): Promise<Agent> {
    const id = String(this.nextId++);
    const newAgent = { ...agent, id };
    this.agents.set(id, newAgent);
    return newAgent;
  }

  async update(id: string, updates: Partial<Agent>): Promise<Agent> {
    const agent = this.agents.get(id);
    if (!agent) throw new Error('Agent not found');
    const updated = { ...agent, ...updates };
    this.agents.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.agents.delete(id);
  }
}

class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();
  private nextId = 1;

  async getAll(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const id = String(this.nextId++);
    const newTask = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error('Task not found');
    const updated = { ...task, ...updates };
    this.tasks.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }
}

class InMemoryChatRepository implements ChatRepository {
  private messages: Map<string, ChatMessage[]> = new Map();
  private nextId = 1;

  async getMessages(agentId: string): Promise<ChatMessage[]> {
    return this.messages.get(agentId) || [];
  }

  async addMessage(agentId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const id = String(this.nextId++);
    const newMessage = { ...message, id };
    const existing = this.messages.get(agentId) || [];
    this.messages.set(agentId, [...existing, newMessage]);
    return newMessage;
  }

  async clearMessages(agentId: string): Promise<void> {
    this.messages.delete(agentId);
  }
}

export const agentRepository: AgentRepository = new InMemoryAgentRepository();
export const taskRepository: TaskRepository = new InMemoryTaskRepository();
export const chatRepository: ChatRepository = new InMemoryChatRepository();
