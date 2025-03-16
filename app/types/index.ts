export interface Form {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  mailingListId?: string;
  teamId: string;
  status: 'draft' | 'active' | 'archived';
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  defaultValue?: string;
} 