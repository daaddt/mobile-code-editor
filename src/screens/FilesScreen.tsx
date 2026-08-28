import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import { useStore } from '../store/useStore';
import { importFile, exportFile, LANGUAGE_OPTIONS } from '../utils/fileSystem';
import type { EditorFile } from '../types';

const COLORS = {
  dark: {
    bg: '#1e1e1e',
    surface: '#252526',
    primary: '#007ACC',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#3e3e42',
    itemBg: '#2d2d30',
    danger: '#F14C4C',
  },
  light: {
    bg: '#ffffff',
    surface: '#f3f3f3',
    primary: '#0066B8',
    text: '#1e1e1e',
    textSecondary: '#888888',
    border: '#e0e0e0',
    itemBg: '#ffffff',
    danger: '#F14C4C',
  },
};

export default function FilesScreen() {
  const files = useStore((s) => s.files);
  const settings = useStore((s) => s.settings);
  const createFile = useStore((s) => s.createFile);
  const deleteFile = useStore((s) => s.deleteFile);
  const renameFile = useStore((s) => s.renameFile);
  const setCurrentFile = useStore((s) => s.setCurrentFile);

  const [modalVisible, setModalVisible] = useState(false);
  const [renameModal, setRenameModal] = useState<{ id: string; name: string } | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [selectedLang, setSelectedLang] = useState('text');
  const [showLangPicker, setShowLangPicker] = useState(false);

  const colors = settings.theme === 'dark' ? COLORS.dark : COLORS.light;

  const handleCreate = useCallback(() => {
    if (!newFileName.trim()) {
      Alert.alert('提示', '请输入文件名');
      return;
    }
    const ext = LANGUAGE_OPTIONS.find((l) => l.value === selectedLang)?.extension;
    const fullName = newFileName.includes('.')
      ? newFileName
      : `${newFileName}.${ext ?? 'txt'}`;
    createFile(fullName, selectedLang);
    setNewFileName('');
    setSelectedLang('text');
    setModalVisible(false);
  }, [newFileName, selectedLang, createFile]);

  const handleDelete = useCallback(
    (file: EditorFile) => {
      Alert.alert(
        '删除文件',
        `确定要删除 "${file.name}" 吗？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => deleteFile(file.id),
          },
        ]
      );
    },
    [deleteFile]
  );

  const handleRename = useCallback(
    (id: string) => {
      renameFile(id, newFileName);
      setNewFileName('');
      setRenameModal(null);
    },
    [newFileName, renameFile]
  );

  const handleExport = useCallback(async (file: EditorFile) => {
    try {
      await exportFile(file.name, file.content);
    } catch (e) {
      Alert.alert('导出失败', (e as Error).message);
    }
  }, []);

  const handleImport = useCallback(async () => {
    try {
      const result = await importFile();
      if (result) {
        createFile(result.name, result.language);
        const newId = useStore.getState().currentFileId;
        if (newId) {
          useStore.getState().updateFileContent(newId, result.content);
        }
      }
    } catch (e) {
      Alert.alert('导入失败', (e as Error).message);
    }
  }, [createFile]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  const renderItem = ({ item }: { item: EditorFile }) => (
    <View style={[styles.fileItem, { backgroundColor: colors.itemBg, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.fileItemContent}
        onPress={() => setCurrentFile(item.id)}
      >
        <View style={styles.fileItemHeader}>
          <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.fileTime, { color: colors.textSecondary }]}>
            {formatTime(item.updatedAt)}
          </Text>
        </View>
        <Text
          style={[styles.filePreview, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.content.slice(0, 60) || '空文件'}
        </Text>
      </TouchableOpacity>
      <View style={styles.fileActions}>
        <TouchableOpacity
          onPress={() => {
            setNewFileName(item.name);
            setRenameModal({ id: item.id, name: item.name });
          }}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>重命名</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleExport(item)}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, { color: colors.primary }]}>导出</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={styles.actionButton}
        >
          <Text style={[styles.actionText, { color: colors.danger }]}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          文件 ({files.length})
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={handleImport}
          >
            <Text style={[styles.headerButtonText, { color: colors.primary }]}>导入</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setNewFileName('');
              setSelectedLang('text');
              setModalVisible(true);
            }}
          >
            <Text style={styles.headerButtonTextWhite}>新建</Text>
          </TouchableOpacity>
        </View>
      </View>

      {files.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>
            暂无文件
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            点击「新建」创建第一个文件
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...files].sort((a, b) => b.updatedAt - a.updatedAt)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* New File Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>新建文件</Text>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>语言</Text>
            <TouchableOpacity
              style={[styles.langPicker, { borderColor: colors.border }]}
              onPress={() => setShowLangPicker(!showLangPicker)}
            >
              <Text style={{ color: colors.text }}>
                {LANGUAGE_OPTIONS.find((l) => l.value === selectedLang)?.label ?? '纯文本'}
              </Text>
            </TouchableOpacity>
            {showLangPicker && (
              <View style={[styles.langList, { borderColor: colors.border, backgroundColor: colors.bg }]}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <TouchableOpacity
                    key={lang.value}
                    style={styles.langOption}
                    onPress={() => {
                      setSelectedLang(lang.value);
                      setShowLangPicker(false);
                    }}
                  >
                    <Text style={{ color: colors.text }}>{lang.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>文件名</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="输入文件名（可选扩展名）"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => {
                  setModalVisible(false);
                  setShowLangPicker(false);
                }}
              >
                <Text style={{ color: colors.text }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleCreate}
              >
                <Text style={styles.modalButtonPrimaryText}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal visible={renameModal !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>重命名文件</Text>
            <TextInput
              style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="输入新文件名"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => {
                  setRenameModal(null);
                  setNewFileName('');
                }}
              >
                <Text style={{ color: colors.text }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={() => renameModal && handleRename(renameModal.id)}
              >
                <Text style={styles.modalButtonPrimaryText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  headerButtonText: { fontSize: 14, fontWeight: '600' },
  headerButtonTextWhite: { fontSize: 14, fontWeight: '600', color: '#fff' },
  list: { paddingBottom: 20 },
  fileItem: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fileItemContent: { flex: 1 },
  fileItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fileName: { fontSize: 15, fontWeight: '500', flex: 1, marginRight: 8 },
  fileTime: { fontSize: 12 },
  filePreview: { fontSize: 13 },
  fileActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionButton: { paddingVertical: 4, paddingHorizontal: 4 },
  actionText: { fontSize: 13, fontWeight: '500' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalLabel: { fontSize: 13, marginBottom: 6, marginTop: 8 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  langPicker: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  langList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  langOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonPrimaryText: { color: '#fff', fontWeight: '600' },
});
