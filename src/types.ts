export type Role = 'user' | 'model';

export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  attachment?: ChatAttachment;
  isError?: boolean;
}

export type PersonaStyle = 'practical' | 'gentle' | 'chatty';

export interface TestScenario {
  id: string;
  title: string;
  prompt: string;
  expected: string;
  category: 'budgeting' | 'tone' | 'clarity' | 'pacing' | 'scope' | 'correction' | 'privacy' | 'security' | 'resilience' | 'multimodal' | 'accuracy' | 'agency';
  status?: 'not run' | 'passed' | 'failed' | 'blocked';
  notes?: string;
}
