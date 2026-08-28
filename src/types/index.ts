export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

export interface EditorSettings {
  theme: 'light' | 'dark';
  fontSize: number;
  lineNumbers: boolean;
  wordWrap: boolean;
  autoIndent: boolean;
  tabSize: number;
}

export type LanguageMode =
  | 'text'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'xml'
  | 'sql'
  | 'cpp'
  | 'java'
  | 'shell'
  | 'yaml'
  | 'go'
  | 'rust';

export interface LanguageOption {
  label: string;
  value: LanguageMode;
  extension: string;
}
