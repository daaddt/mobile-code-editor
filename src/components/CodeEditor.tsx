import React, { useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { CODEMIRROR_HTML } from './codemirror-html';
import type { EditorSettings } from '../types';

type WebViewRefType = InstanceType<typeof WebView>;

export interface CodeEditorRef {
  setContent: (content: string) => void;
  setLanguage: (language: string) => void;
  applySettings: (settings: Partial<EditorSettings>) => void;
  insertText: (text: string) => void;
  format: () => void;
}

interface CodeEditorProps {
  content: string;
  language: string;
  settings: EditorSettings;
  onContentChange: (content: string) => void;
  onReady?: () => void;
}

function sendCommand(webviewRef: { current: WebViewRefType | null }, command: object) {
  const json = JSON.stringify(command).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  const script = `window.handleCommand && window.handleCommand('${json}'); true;`;
  webviewRef.current?.injectJavaScript(script);
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(
  ({ content, language, settings, onContentChange, onReady }, ref) => {
    const webviewRef = useRef<WebViewRefType>(null);
    const isReady = useRef(false);
    const changeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      setContent: (newContent: string) => {
        sendCommand(webviewRef, {
          type: 'setContent',
          content: newContent,
        });
      },
      setLanguage: (lang: string) => {
        sendCommand(webviewRef, { type: 'setLanguage', language: lang });
      },
      applySettings: (partial: Partial<EditorSettings>) => {
        sendCommand(webviewRef, { type: 'setSettings', settings: partial });
      },
      insertText: (text: string) => {
        sendCommand(webviewRef, { type: 'insertText', text });
      },
      format: () => {
        sendCommand(webviewRef, { type: 'format' });
      },
    }));

    // Initialize editor when WebView loads
    const handleLoad = useCallback(() => {
      const initCommand = {
        type: 'init',
        content: content,
        language: language,
        theme: settings.theme,
        fontSize: settings.fontSize,
        lineNumbers: settings.lineNumbers,
        wordWrap: settings.wordWrap,
        autoIndent: settings.autoIndent,
        tabSize: settings.tabSize,
      };
      sendCommand(webviewRef, initCommand);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle messages from WebView
    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          switch (data.type) {
            case 'ready':
              isReady.current = true;
              onReady?.();
              break;
            case 'change':
              if (changeTimeout.current) clearTimeout(changeTimeout.current);
              changeTimeout.current = setTimeout(() => {
                onContentChange(data.content);
              }, 300);
              break;
            case 'error':
              console.warn('CodeEditor error:', data.message);
              break;
          }
        } catch (e) {
          // Ignore parse errors
        }
      },
      [onContentChange, onReady]
    );

    // Update language when it changes
    useEffect(() => {
      if (isReady.current) {
        sendCommand(webviewRef, { type: 'setLanguage', language });
      }
    }, [language]);

    // Update settings when they change
    useEffect(() => {
      if (isReady.current) {
        sendCommand(webviewRef, { type: 'setSettings', settings: { ...settings } });
      }
    }, [settings]);

    return (
      <View style={styles.container}>
        <WebView
          ref={webviewRef}
          source={{ html: CODEMIRROR_HTML, baseUrl: 'about:blank' }}
          style={styles.webview}
          onMessage={handleMessage}
          onLoad={handleLoad}
          originWhitelist={['*']}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="compatibility"
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          containerStyle={styles.webview}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          )}
          startInLoadingState
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
  },
});

export default CodeEditor;
