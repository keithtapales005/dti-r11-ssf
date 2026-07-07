import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class DepartmentService {
  async getAllDepartments() {
    const { data, error } = await supabase
      .from('department')
      .select('department_id, department_name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getDepartment(department_id: number) {
    const { data, error } = await supabase
      .from('department')
      .select('department_id, department_name')
      .eq('department_id', department_id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
