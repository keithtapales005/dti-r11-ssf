import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class StatusStageService {
  async getAllStatusStages() {
    const { data, error } = await supabase
      .from('approved_status_stage')
      .select('approved_status_stage_id, approved_status_type_id, stage_name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getStatusStage(approved_status_stage_id: number) {
    const { data, error } = await supabase
      .from('approved_status_stage')
      .select('approved_status_stage_id, approved_status_type_id, stage_name')
      .eq('approved_status_stage_id', approved_status_stage_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
