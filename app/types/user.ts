export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'pending' | 'inactive';
  user_type: 'interno' | 'externo';
};
