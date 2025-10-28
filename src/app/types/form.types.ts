export interface Field {
  id: string | number;
  label: string;
  type: 'text' | 'number' | 'radio' | 'toggle';
  required?: boolean;
  options?: string[];
  default?: any;
  value?: any;
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
}

export interface RequestData {
  id: string;
  title: string;
  sections: Section[];
}

export interface FormData {
  requestData?: RequestData;
}

export interface FormState {
  formData: Partial<FormData>;
  availableSchemas: RequestData[];
  schemasLoaded: boolean;
  isLoading: boolean;
  errors: string[];
  isCompleted: boolean;
}

export interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
  lastSaved?: Date;
}

export interface AutoSaveConfig {
  enabled: boolean;
  interval: number;
  retryAttempts: number;
}