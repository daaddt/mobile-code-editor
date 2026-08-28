import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useStore } from './src/store/useStore';

import EditorScreen from './src/screens/EditorScreen';
import FilesScreen from './src/screens/FilesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  editor: '✎',
  files: '☰',
  settings: '⚙',
};

function TabIcon({ name, color }: { name: string; color: string }) {
  return (
    <View style={{ padding: 4 }}>
      <Text style={{ fontSize: 18, color }}>{name}</Text>
    </View>
  );
}

export default function App() {
  const theme = useStore((s) => s.settings.theme);

  const navTheme =
    theme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: '#007ACC',
            background: '#1e1e1e',
            card: '#252526',
            text: '#ffffff',
            border: '#3e3e42',
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: '#0066B8',
            background: '#ffffff',
            card: '#f3f3f3',
            text: '#1e1e1e',
            border: '#e0e0e0',
          },
        };

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: navTheme.colors.primary,
            tabBarInactiveTintColor: theme === 'dark' ? '#888' : '#666',
            tabBarStyle: {
              backgroundColor: navTheme.colors.card,
              borderTopColor: navTheme.colors.border,
              paddingBottom: 4,
              paddingTop: 4,
              height: 56,
            },
            headerShown: true,
          }}
        >
          <Tab.Screen
            name="Editor"
            component={EditorScreen}
            options={{
              title: '编辑器',
              tabBarIcon: ({ color }) => <TabIcon name={ICONS.editor} color={color} />,
            }}
          />
          <Tab.Screen
            name="Files"
            component={FilesScreen}
            options={{
              title: '文件',
              tabBarIcon: ({ color }) => <TabIcon name={ICONS.files} color={color} />,
              headerTitle: '文件列表',
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: '设置',
              tabBarIcon: ({ color }) => <TabIcon name={ICONS.settings} color={color} />,
              headerTitle: '设置',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
