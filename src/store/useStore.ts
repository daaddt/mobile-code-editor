import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EditorFile, EditorSettings, LanguageMode } from '../types';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'dark',
  fontSize: 14,
  lineNumbers: true,
  wordWrap: false,
  autoIndent: true,
  tabSize: 2,
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function getLanguageFromFilename(filename: string): LanguageMode {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, LanguageMode> = {
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'css',
    json: 'json',
    md: 'markdown',
    markdown: 'markdown',
    xml: 'xml',
    sql: 'sql',
    c: 'cpp',
    cpp: 'cpp',
    h: 'cpp',
    java: 'java',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    yml: 'yaml',
    yaml: 'yaml',
    go: 'go',
    rs: 'rust',
  };
  return map[ext] ?? 'text';
}

interface StoreState {
  files: EditorFile[];
  currentFileId: string | null;
  settings: EditorSettings;

  createFile: (name: string, language?: string) => string;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  updateFileContent: (id: string, content: string) => void;
  setCurrentFile: (id: string | null) => void;
  getFileById: (id: string) => EditorFile | undefined;

  updateSettings: (partial: Partial<EditorSettings>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      files: [],
      currentFileId: null,
      settings: DEFAULT_SETTINGS,

      createFile: (name: string, language?: string) => {
        const id = generateId();
        const now = Date.now();
        const lang = language ?? getLanguageFromFilename(name);
        const file: EditorFile = {
          id,
          name,
          content: '',
          language: lang,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          files: [...state.files, file],
          currentFileId: id,
        }));
        return id;
      },

      deleteFile: (id: string) => {
        set((state) => {
          const files = state.files.filter((f) => f.id !== id);
          const currentFileId =
            state.currentFileId === id
              ? files.length > 0
                ? files[0].id
                : null
              : state.currentFileId;
          return { files, currentFileId };
        });
      },

      renameFile: (id: string, name: string) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id
              ? {
                  ...f,
                  name,
                  language: getLanguageFromFilename(name),
                  updatedAt: Date.now(),
                }
              : f
          ),
        }));
      },

      updateFileContent: (id: string, content: string) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, content, updatedAt: Date.now() } : f
          ),
        }));
      },

      setCurrentFile: (id: string | null) => {
        set({ currentFileId: id });
      },

      getFileById: (id: string) => {
        return get().files.find((f) => f.id === id);
      },

      updateSettings: (partial: Partial<EditorSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },
    }),
    {
      name: 'code-editor-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
