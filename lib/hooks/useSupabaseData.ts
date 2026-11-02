import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase/client';
import { useStore } from '../store';
import { getSession } from '../supabase/auth';
import { agentRepository, taskRepository } from '../repository/supabase';

export function useSupabaseData() {
  const { setAgents, setTasks, addAgent, updateAgent, addTask, updateTask } = useStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, using in-memory data');
      return;
    }

    let agentChannel: any;
    let taskChannel: any;

    async function initialize() {
      try {
        // Check if user is authenticated (or try anonymous if allowed)
        let session = await getSession();
        
        if (!session && process.env.NEXT_PUBLIC_ALLOW_ANON_SIGNIN === 'true') {
          // Try anonymous sign-in if no session and it's allowed
          const { signInAnonymously } = await import('../supabase/auth');
          const { session: anonSession } = await signInAnonymously();
          session = anonSession;
        }
        
        if (!session) {
          console.warn('No active session, skipping data load');
          return;
        }

        // Load initial data
        const [agents, tasks] = await Promise.all([
          agentRepository.getAll(),
          taskRepository.getAll(),
        ]);

        setAgents(agents);
        setTasks(tasks);

        // Set up realtime subscriptions
        if (!supabase) return;
        
        agentChannel = supabase
          .channel('agents-changes')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'agents' },
            (payload) => {
              const agent = mapDbAgentToAgent(payload.new);
              addAgent(agent);
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'agents' },
            (payload) => {
              const agent = mapDbAgentToAgent(payload.new);
              updateAgent(agent.id, agent);
            }
          )
          .subscribe();

        taskChannel = supabase
          .channel('tasks-changes')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'tasks' },
            (payload) => {
              const task = mapDbTaskToTask(payload.new);
              addTask(task);
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'tasks' },
            (payload) => {
              const task = mapDbTaskToTask(payload.new);
              updateTask(task.id, task);
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Failed to initialize Supabase data:', err);
      }
    }

    initialize();

    return () => {
      if (agentChannel && supabase) {
        supabase.removeChannel(agentChannel);
      }
      if (taskChannel && supabase) {
        supabase.removeChannel(taskChannel);
      }
    };
  }, [setAgents, setTasks, addAgent, updateAgent, addTask, updateTask]);
}

function mapDbAgentToAgent(row: any) {
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

function mapDbTaskToTask(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    assignedTo: row.assignee_id,
  };
}
