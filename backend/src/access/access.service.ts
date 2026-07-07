import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class AccessService {
  async getAllUserStatuses() {
    const { data, error } = await supabase.from('user_status').select('*');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getUserStatusById(user_status_id: number) {
    const { data, error } = await supabase
      .from('user_status')
      .select('user_status_id, user_status_name')
      .eq('user_status_id', user_status_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
