import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';

export interface Task {
  id: string;
  organization_id: string;
  branch_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  created_by: string;
  due_date: string;
  due_time?: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  created_at: string;
  updated_at: string;
}

export const taskService = {
  async getTasks(staffId?: string, status?: string): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*, assigned:assigned_to(full_name), creator:created_by(full_name)')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID);

    if (staffId) {
      query = query.eq('assigned_to', staffId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getTask(id: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },
};