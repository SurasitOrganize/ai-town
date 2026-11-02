import { Agent, Task, ChatMessage } from '../store';

export interface AgentRepository {
  getAll(): Promise<Agent[]>;
  getById(id: string): Promise<Agent | null>;
  create(agent: Omit<Agent, 'id'>): Promise<Agent>;
  update(id: string, updates: Partial<Agent>): Promise<Agent>;
  delete(id: string): Promise<void>;
}

export interface TaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(task: Omit<Task, 'id'>): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
}

export interface ChatRepository {
  getMessages(agentId: string): Promise<ChatMessage[]>;
  addMessage(agentId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;
  clearMessages(agentId: string): Promise<void>;
}
