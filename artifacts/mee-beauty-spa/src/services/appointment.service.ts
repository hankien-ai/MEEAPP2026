import { supabase, DEFAULT_ORG_ID, DEFAULT_BRANCH_ID } from './supabase';

export interface Appointment {
  id: string;
  organization_id: string;
  branch_id: string;
  customer_id: string;
  staff_id: string;
  service_id?: string;
  service_name?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  note?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const appointmentService = {
  async getAppointments(staffId?: string, date?: string): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*, customer:customer_id(full_name, phone), staff:staff_id(full_name), service:service_id(name)')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('branch_id', DEFAULT_BRANCH_ID);

    if (staffId) {
      query = query.eq('staff_id', staffId);
    }
    if (date) {
      query = query.eq('appointment_date', date);
    }

    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getAppointment(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...appointment,
        organization_id: DEFAULT_ORG_ID,
        branch_id: DEFAULT_BRANCH_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteAppointment(id: string): Promise<void> {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
  },
};