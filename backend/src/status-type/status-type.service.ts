import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class StatusTypeService {
  async getAllStatusTypes() {
    const { data, error } = await supabase
      .from('approved_status_type')
      .select('approved_status_type_id, approved_status_name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getStatusType(status_type_id: number) {
    const { data, error } = await supabase
      .from('approved_status_type')
      .select('approved_status_type_id, approved_status_name')
      .eq('approved_status_type_id', status_type_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
