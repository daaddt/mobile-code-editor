import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CodeEditor, { type CodeEditorRef } from '../components/CodeEditor';
import { useStore } from '../store/useStore';
import { exportFile, importFile } from '../utils/fileSystem';

type NavType = {
  navigate: (screen: string) => void;
  setOptions: (options: { headerTitle?: string; headerShown?: boolean; headerStyle?: { backgroundColor: string }; headerTitleStyle?: { color: string; fontSize: number }; headerTintColor?: string }) => void;
};

const COLORS = {
  dark: {
    bg: '#1e1e1e',
    surface: '#252526',
    primary: '#007ACC',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#3e3e42',
  },
  light: {
    bg: '#ffffff',
    surface: '#f3f3f3',
    primary: '#0066B8',
    text: '#1e1e1e',
    textSecondary: '#888888',
    border: '#e0e0e0',
  },
};

export default function EditorScreen() {
  const navigation = useNavigation<NavType>();
  const editorRef = useRef<CodeEditorRef>(null);
  const files = useStore((s) => s.files);
  const currentFileId = useStore((s) => s.currentFileId);
  const settings = useStore((s) => s.settings);
  const updateFileContent = useStore((s) => s.updateFileContent);
  const createFile = useStore((s) => s.createFile);
  const [saved, setSaved] = useState(true);

  const currentFile = files.find((f) => f.id === currentFileId);

  const colors = settings.theme === 'dark' ? COLORS.dark : COLORS.light;

  const handleContentChange = useCallback(
    (content: string) => {
      if (currentFileId) {
        updateFileContent(currentFileId, content);
        setSaved(false);
      }
    },
    [currentFileId, updateFileContent]
  );

  const handleSave = useCallback(async () => {
    if (!currentFile) return;
    try {
      await exportFile(currentFile.name, currentFile.content);
      setSaved(true);
    } catch (e) {
      Alert.alert('导出失败', (e as Error).message);
    }
  }, [currentFile]);

  const handleFormat = useCallback(() => {
    editorRef.current?.format();
  }, []);

  const handleImport = useCallback(async () => {
    try {
      const result = await importFile();
      if (result) {
        createFile(result.name, result.language);
        const newId = useStore.getState().currentFileId;
        if (newId) {
          updateFileContent(newId, result.content);
        }
      }
    } catch (e) {
      Alert.alert('导入失败', (e as Error).message);
    }
  }, [createFile, updateFileContent]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: currentFile ? currentFile.name : '无文件',
      headerShown: true,
      headerStyle: { backgroundColor: colors.surface },
      headerTitleStyle: { color: colors.text, fontSize: 14 },
      headerTintColor: colors.primary,
    });
  }, [navigation, currentFile, colors]);

  if (!currentFile) {
    return (
      <SafeAreaView style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>没有打开的文件</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          从文件页面创建或导入文件
        </Text>
        <View style={styles.emptyActions}>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Files')}
          >
            <Text style={styles.emptyButtonText}>前往文件列表</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.toolbar}>
        <Text
          style={[styles.fileName, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {currentFile.name}
          {!saved ? ' •' : ''}
        </Text>
        <View style={styles.toolbarActions}>
          <TouchableOpacity onPress={handleFormat} style={styles.toolbarButton}>
            <Text style={[styles.toolbarButtonText, { color: colors.primary }]}>
              格式化
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.toolbarButton}>
            <Text style={[styles.toolbarButtonText, { color: colors.primary }]}>
              导出
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.editorContainer}>
        <CodeEditor
          ref={editorRef}
          content={currentFile.content}
          language={currentFile.language}
          settings={settings}
          onContentChange={handleContentChange}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  ...Platform.select({
    android: {
      paddingBottom: 0,
    },
  }),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  fileName: {
    fontSize: 13,
    fontFamily: 'monospace',
    flex: 1,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  toolbarButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editorContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
