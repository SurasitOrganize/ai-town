import { supabase, isSupabaseConfigured } from '../supabase/client';
import { Agent, Task, ChatMessage } from '../store';
import { AgentRepository, TaskRepository, ChatRepository } from './types';

// Supabase implementation
class SupabaseAgentRepository implements AgentRepository {
  async getAll(): Promise<Agent[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('agents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.mapToAgent);
  }

  async getById(id: string): Promise<Agent | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapToAgent(data);
  }

  async create(agent: Omit<Agent, 'id'>): Promise<Agent> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('agents')
      .insert([{
        name: agent.name,
        role: agent.role,
        instructions: '',
        allowed_tools: [],
        status: agent.status,
        desk_x: agent.x || null,
        desk_y: agent.y || null,
        avatar: agent.avatar,
        is_lead: false,
      }])
      .select()
      .single();

    if (error) throw error;

    return this.mapToAgent(data);
  }

  async update(id: string, updates: Partial<Agent>): Promise<Agent> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const dbUpdates: any = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.x !== undefined) dbUpdates.desk_x = updates.x;
    if (updates.y !== undefined) dbUpdates.desk_y = updates.y;
    if (updates.avatar) dbUpdates.avatar = updates.avatar;

    const { data, error } = await client
      .from('agents')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToAgent(data);
  }

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { error } = await client
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToAgent(row: any): Agent {
    // Determine task status based on agent status
    let taskStatus: 'idle' | 'working' | 'meeting' = 'idle';
    if (row.status === 'busy') {
      taskStatus = 'meeting';
    } else if (row.status === 'online') {
      taskStatus = 'working';
    }

    return {
      id: row.id,
      name: row.name,
      role: row.role,
      status: row.status,
      taskStatus,
      x: row.desk_x,
      y: row.desk_y,
      avatar: row.avatar || '🤖',
    };
  }
}

class SupabaseTaskRepository implements TaskRepository {
  async getAll(): Promise<Task[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(this.mapToTask);
  }

  async getById(id: string): Promise<Task | null> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error} = await client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapToTask(data);
  }

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('tasks')
      .insert([{
        title: task.title,
        description: task.description || '',
        status: task.status,
        assignee_id: task.assignedTo || null,
      }])
      .select()
      .single();

    if (error) throw error;

    return this.mapToTask(data);
  }

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const dbUpdates: any = {};
    
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.assignedTo !== undefined) dbUpdates.assignee_id = updates.assignedTo;

    const { data, error } = await client
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return this.mapToTask(data);
  }

  async delete(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  private mapToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      status: row.status,
      assignedTo: row.assignee_id,
    };
  }
}

class SupabaseChatRepository implements ChatRepository {
  async getMessages(agentId: string): Promise<ChatMessage[]> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(this.mapToMessage);
  }

  async addMessage(agentId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { data, error } = await client
      .from('messages')
      .insert([{
        agent_id: agentId,
        role: message.sender === 'You' ? 'user' : 'agent',
        content: message.content,
      }])
      .select()
      .single();

    if (error) throw error;

    return this.mapToMessage(data);
  }

  async clearMessages(agentId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    
    const client = supabase;
    const { error } = await client
      .from('messages')
      .delete()
      .eq('agent_id', agentId);

    if (error) throw error;
  }

  private mapToMessage(row: any): ChatMessage {
    return {
      id: row.id,
      sender: row.role === 'user' ? 'You' : 'Agent',
      content: row.content,
      timestamp: new Date(row.created_at),
    };
  }
}

// Export instances based on configuration
export const agentRepository: AgentRepository = isSupabaseConfigured()
  ? new SupabaseAgentRepository()
  : null as any;

export const taskRepository: TaskRepository = isSupabaseConfigured()
  ? new SupabaseTaskRepository()
  : null as any;

export const chatRepository: ChatRepository = isSupabaseConfigured()
  ? new SupabaseChatRepository()
  : null as any;
