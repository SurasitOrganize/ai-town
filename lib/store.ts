import { create } from 'zustand';

export type AgentStatus = 'online' | 'busy' | 'offline';
export type TaskStatus = 'idle' | 'working' | 'meeting';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  taskStatus: TaskStatus;
  x?: number;
  y?: number;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  assignedTo?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface AppState {
  agents: Agent[];
  tasks: Task[];
  selectedAgent: Agent | null;
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  selectAgent: (agent: Agent | null) => void;
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  toggleChat: (open: boolean) => void;
}

// Mock initial data
const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Alice',
    role: 'Senior Developer',
    status: 'online',
    taskStatus: 'working',
    avatar: '👩‍💻',
  },
  {
    id: '2',
    name: 'Bob',
    role: 'Designer',
    status: 'online',
    taskStatus: 'idle',
    avatar: '👨‍🎨',
  },
  {
    id: '3',
    name: 'Charlie',
    role: 'Product Manager',
    status: 'busy',
    taskStatus: 'meeting',
    avatar: '👔',
  },
  {
    id: '4',
    name: 'Diana',
    role: 'Data Analyst',
    status: 'online',
    taskStatus: 'working',
    avatar: '📊',
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review API design',
    description: 'Review the new authentication API endpoints',
    status: 'todo',
  },
  {
    id: '2',
    title: 'Update user dashboard',
    description: 'Implement new analytics widgets',
    status: 'doing',
    assignedTo: '1',
  },
  {
    id: '3',
    title: 'Fix navigation bug',
    description: 'Resolve mobile navigation issues',
    status: 'done',
    assignedTo: '2',
  },
];

export const useStore = create<AppState>((set) => ({
  agents: mockAgents,
  tasks: mockTasks,
  selectedAgent: null,
  chatMessages: [],
  isChatOpen: false,
  
  setAgents: (agents) => set({ agents }),
  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),
  updateAgent: (id, updates) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    })),
  selectAgent: (agent) => set({ selectedAgent: agent }),
  
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),
  toggleChat: (open) => set({ isChatOpen: open }),
}));
