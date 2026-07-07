import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class ProvinceService {
  async getAllProvinces() {
    const { data, error } = await supabase
      .from('province')
      .select('province_id, province_name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getProvince(province_id: number) {
    const { data, error } = await supabase
      .from('province')
      .select('province_id, province_name')
      .eq('province_id', province_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
