import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useStore } from '../store/useStore';
import type { EditorSettings } from '../types';

const COLORS = {
  dark: {
    bg: '#1e1e1e',
    surface: '#252526',
    primary: '#007ACC',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#3e3e42',
    itemBg: '#2d2d30',
  },
  light: {
    bg: '#f3f3f3',
    surface: '#ffffff',
    primary: '#0066B8',
    text: '#1e1e1e',
    textSecondary: '#666666',
    border: '#e0e0e0',
    itemBg: '#ffffff',
  },
};

interface SettingRowProps {
  label: string;
  description?: string;
  colors: typeof COLORS.dark;
  children: React.ReactNode;
}

function SettingRow({ label, description, colors, children }: SettingRowProps) {
  return (
    <View style={[styles.row, { backgroundColor: colors.itemBg, borderBottomColor: colors.border }]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.rowDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const colors = settings.theme === 'dark' ? COLORS.dark : COLORS.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          外观
        </Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow
            label="深色模式"
            description="切换编辑器深色/浅色主题"
            colors={colors}
          >
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={(v) =>
                updateSettings({ theme: v ? 'dark' : 'light' })
              }
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </SettingRow>

          <SettingRow label="字号" colors={colors}>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: colors.border }]}
                onPress={() =>
                  updateSettings({
                    fontSize: Math.max(10, settings.fontSize - 1),
                  })
                }
              >
                <Text style={[styles.stepperText, { color: colors.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.stepperValue, { color: colors.text }]}>
                {settings.fontSize}
              </Text>
              <TouchableOpacity
                style={[styles.stepperButton, { borderColor: colors.border }]}
                onPress={() =>
                  updateSettings({
                    fontSize: Math.min(28, settings.fontSize + 1),
                  })
                }
              >
                <Text style={[styles.stepperText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </SettingRow>
        </View>

        {/* Editor */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          编辑器
        </Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingRow
            label="行号"
            description="显示行号"
            colors={colors}
          >
            <Switch
              value={settings.lineNumbers}
              onValueChange={(v) => updateSettings({ lineNumbers: v })}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </SettingRow>

          <SettingRow
            label="自动换行"
            description="长行自动换行显示"
            colors={colors}
          >
            <Switch
              value={settings.wordWrap}
              onValueChange={(v) => updateSettings({ wordWrap: v })}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </SettingRow>

          <SettingRow
            label="自动缩进"
            description="输入时自动保持缩进"
            colors={colors}
          >
            <Switch
              value={settings.autoIndent}
              onValueChange={(v) => updateSettings({ autoIndent: v })}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          </SettingRow>

          <SettingRow label="Tab 宽度" colors={colors}>
            <View style={styles.tabSizeSelector}>
              {[2, 4, 8].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.tabSizeButton,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        settings.tabSize === size
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => updateSettings({ tabSize: size })}
                >
                  <Text
                    style={[
                      styles.tabSizeText,
                      {
                        color:
                          settings.tabSize === size ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingRow>
        </View>

        {/* About */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          关于
        </Text>
        <View style={[styles.section, { borderColor: colors.border }]}>
          <View style={[styles.row, { backgroundColor: colors.itemBg }]}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                版本
              </Text>
            </View>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            移动代码编辑器
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            基于 React Native + CodeMirror
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    textTransform: 'uppercase',
  },
  section: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    minHeight: 52,
  },
  rowText: {
    flex: 1,
    marginRight: 16,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepperValue: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  tabSizeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  tabSizeButton: {
    width: 36,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSizeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
