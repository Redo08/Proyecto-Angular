export class Permission {
  id?: number;
  url?: string;
  method?: string; // e.g., 'GET', 'POST', 'PUT', 'DELETE'
  entity?: string; // e.g., 'User', 'Role', 'Permission'
  created_at?: Date;
  updated_at?: Date;
  has_permission?: boolean; // Este campo es para el frontend en la vista de asignación de roles
}

export interface GroupedPermissions {
  entity: string;
  permissions: Permission[];
}