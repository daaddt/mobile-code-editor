import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getLanguageFromFilename } from '../store/useStore';

const FILES_DIR = `${FileSystem.documentDirectory}editor-files/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(FILES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(FILES_DIR, { intermediates: true });
  }
}

export async function exportFile(
  name: string,
  content: string
): Promise<void> {
  await ensureDir();
  const path = `${FILES_DIR}${name}`;
  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }
}

export async function importFile(): Promise<{
  name: string;
  content: string;
  language: string;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const content = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return {
    name: asset.name,
    content,
    language: getLanguageFromFilename(asset.name),
  };
}

export const LANGUAGE_OPTIONS = [
  { label: '纯文本', value: 'text' as const, extension: 'txt' },
  { label: 'JavaScript', value: 'javascript' as const, extension: 'js' },
  { label: 'TypeScript', value: 'typescript' as const, extension: 'ts' },
  { label: 'Python', value: 'python' as const, extension: 'py' },
  { label: 'HTML', value: 'html' as const, extension: 'html' },
  { label: 'CSS', value: 'css' as const, extension: 'css' },
  { label: 'JSON', value: 'json' as const, extension: 'json' },
  { label: 'Markdown', value: 'markdown' as const, extension: 'md' },
  { label: 'XML', value: 'xml' as const, extension: 'xml' },
  { label: 'SQL', value: 'sql' as const, extension: 'sql' },
  { label: 'C/C++', value: 'cpp' as const, extension: 'cpp' },
  { label: 'Java', value: 'java' as const, extension: 'java' },
  { label: 'Shell', value: 'shell' as const, extension: 'sh' },
  { label: 'YAML', value: 'yaml' as const, extension: 'yml' },
  { label: 'Go', value: 'go' as const, extension: 'go' },
  { label: 'Rust', value: 'rust' as const, extension: 'rs' },
];
