export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      task_completions: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          completed_date: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          completed_date: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          completed_date?: string;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_completions_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'task_completions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          priority: number | null;
          due_date: string | null;
          recurrence_rule: string | null;
          status: 'active' | 'completed';
          original_input: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          priority?: number | null;
          due_date?: string | null;
          recurrence_rule?: string | null;
          status?: 'active' | 'completed';
          original_input?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          priority?: number | null;
          due_date?: string | null;
          recurrence_rule?: string | null;
          status?: 'active' | 'completed';
          original_input?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
