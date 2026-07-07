export type User = {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role_id: number;
  department_id: number;
  password_hash?: string;
  user_status_id: number;
};
