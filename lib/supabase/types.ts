export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          created_at: string
          name: string
          role: string
          instructions: string | null
          allowed_tools: string[] | null
          status: 'online' | 'busy' | 'offline'
          desk_x: number | null
          desk_y: number | null
          avatar: string | null
          is_lead: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role: string
          instructions?: string | null
          allowed_tools?: string[] | null
          status?: 'online' | 'busy' | 'offline'
          desk_x?: number | null
          desk_y?: number | null
          avatar?: string | null
          is_lead?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string
          instructions?: string | null
          allowed_tools?: string[] | null
          status?: 'online' | 'busy' | 'offline'
          desk_x?: number | null
          desk_y?: number | null
          avatar?: string | null
          is_lead?: boolean
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          status: 'todo' | 'doing' | 'done'
          assignee_id: string | null
          parent_id: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          status?: 'todo' | 'doing' | 'done'
          assignee_id?: string | null
          parent_id?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'doing' | 'done'
          assignee_id?: string | null
          parent_id?: string | null
          created_by?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          agent_id: string | null
          role: 'user' | 'agent' | 'system'
          content: string
          task_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          agent_id?: string | null
          role: 'user' | 'agent' | 'system'
          content: string
          task_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          agent_id?: string | null
          role?: 'user' | 'agent' | 'system'
          content?: string
          task_id?: string | null
        }
      }
      approvals: {
        Row: {
          id: string
          created_at: string
          task_id: string | null
          action: string
          payload: Json | null
          status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          created_at?: string
          task_id?: string | null
          action: string
          payload?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          created_at?: string
          task_id?: string | null
          action?: string
          payload?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
        }
      }
    }
  }
}
