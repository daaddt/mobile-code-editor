/**
 * CodeMirror 5 HTML template for WebView-based code editor.
 * Handles editor initialization, content sync, and RN ↔ WebView communication.
 */

const CODEMIRROR_VERSION = '5.65.16';
const CDN = `https://cdnjs.cloudflare.com/ajax/libs/codemirror/${CODEMIRROR_VERSION}`;

function buildHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <link rel="stylesheet" href="${CDN}/codemirror.min.css">
  <link rel="stylesheet" href="${CDN}/theme/material-darker.min.css">
  <link rel="stylesheet" href="${CDN}/theme/neo.min.css">
  <link rel="stylesheet" href="${CDN}/addon/edit/closetag.min.css">
  <link rel="stylesheet" href="${CDN}/addon/hint/show-hint.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; overflow: hidden; background: #1e1e1e; }
    .CodeMirror {
      height: 100%;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
    }
    .CodeMirror-scroll { overflow: auto; }
    .CodeMirror-focused .cm-matchhighlight {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAAByZe0PAAAAQklEQVQI12NgQYGRgQwBLjTgQyMjID9//8PAxKAgwnFsGhhYWFgYuhjY2NjE2NjY+fn5/Hx8f/AwQjpAATE7AMSFKCgoQFQEf5QPiAAAAAElFTkSuQmCC);
      background-position: bottom;
      background-size: 100% 6px;
    }
    .cm-s-material-darker.CodeMirror { background: #1e1e1e; }
    .cm-s-neo.CodeMirror { background: #ffffff; }
  </style>
</head>
<body>
  <textarea id="editor"></textarea>

  <!-- CodeMirror core -->
  <script src="${CDN}/codemirror.min.js"></script>
  <script src="${CDN}/addon/edit/closebrackets.min.js"></script>
  <script src="${CDN}/addon/edit/closetag.min.js"></script>
  <script src="${CDN}/addon/edit/matchbrackets.min.js"></script>
  <script src="${CDN}/addon/edit/codemirror-mode-overlay.min.js"></script>
  <script src="${CDN}/addon/selection/active-line.min.js"></script>
  <script src="${CDN}/addon/edit/trailingspace.min.js"></script>
  <script src="${CDN}/addon/hint/show-hint.min.js"></script>
  <script src="${CDN}/addon/hint/javascript-hint.min.js"></script>

  <!-- Language modes -->
  <script src="${CDN}/mode/javascript/javascript.min.js"></script>
  <script src="${CDN}/mode/python/python.min.js"></script>
  <script src="${CDN}/mode/xml/xml.min.js"></script>
  <script src="${CDN}/mode/css/css.min.js"></script>
  <script src="${CDN}/mode/markdown/markdown.min.js"></script>
  <script src="${CDN}/mode/sql/sql.min.js"></script>
  <script src="${CDN}/mode/clike/clike.min.js"></script>
  <script src="${CDN}/mode/shell/shell.min.js"></script>
  <script src="${CDN}/mode/yaml/yaml.min.js"></script>
  <script src="${CDN}/mode/go/go.min.js"></script>
  <script src="${CDN}/mode/rust/rust.min.js"></script>
  <script src="${CDN}/mode/properties/properties.min.js"></script>

  <script>
    (function() {
      var editor = null;
      var isApplyingChange = false;

      function getMode(language) {
        var modeMap = {
          'text': 'text/plain',
          'javascript': { name: 'javascript', json: false },
          'typescript': { name: 'javascript', typescript: true, json: false },
          'json': { name: 'javascript', json: true },
          'python': 'python',
          'html': 'htmlmixed',
          'css': 'css',
          'markdown': 'markdown',
          'xml': 'xml',
          'sql': 'sql',
          'cpp': 'text/x-c++src',
          'java': 'text/x-java',
          'shell': 'shell',
          'yaml': 'yaml',
          'go': 'go',
          'rust': 'rust',
        };
        return modeMap[language] || 'text/plain';
      }

      function postMessage(data) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }

      function initEditor(config) {
        var textarea = document.getElementById('editor');
        textarea.value = config.content || '';

        editor = CodeMirror.fromTextArea(textarea, {
          mode: getMode(config.language || 'text'),
          theme: config.theme === 'light' ? 'neo' : 'material-darker',
          lineNumbers: config.lineNumbers !== false,
          lineWrapping: config.wordWrap === true,
          autoCloseBrackets: true,
          autoCloseTags: true,
          matchBrackets: true,
          styleActiveLine: true,
          indentUnit: config.tabSize || 2,
          tabSize: config.tabSize || 2,
          indentWithTabs: false,
          autoIndent: config.autoIndent !== false,
          inputStyle: 'contenteditable',
          extraKeys: {
            'Ctrl-Space': 'autocomplete',
            'Cmd-Space': 'autocomplete',
          },
        });

        if (config.fontSize) {
          editor.getWrapperElement().style.fontSize = config.fontSize + 'px';
          editor.refresh();
        }

        editor.on('change', function(instance, changeObj) {
          if (isApplyingChange) return;
          var content = instance.getValue();
          postMessage({ type: 'change', content: content });
        });

        editor.on('scroll', function(instance) {
          var scrollInfo = instance.getScrollInfo();
          postMessage({
            type: 'scroll',
            top: scrollInfo.top,
            left: scrollInfo.left,
          });
        });

        postMessage({ type: 'ready' });
      }

      function setContent(content) {
        if (!editor) return;
        if (editor.getValue() === content) return;
        isApplyingChange = true;
        var cursor = editor.getCursor();
        editor.setValue(content || '');
        editor.setCursor(cursor);
        isApplyingChange = false;
      }

      function setLanguage(language) {
        if (!editor) return;
        editor.setOption('mode', getMode(language));
      }

      function setSettings(settings) {
        if (!editor) return;
        if (settings.theme) {
          editor.setOption('theme', settings.theme === 'light' ? 'neo' : 'material-darker');
        }
        if (settings.fontSize) {
          editor.getWrapperElement().style.fontSize = settings.fontSize + 'px';
          editor.refresh();
        }
        if (settings.lineNumbers !== undefined) {
          editor.setOption('lineNumbers', settings.lineNumbers);
        }
        if (settings.wordWrap !== undefined) {
          editor.setOption('lineWrapping', settings.wordWrap);
        }
        if (settings.tabSize) {
          editor.setOption('indentUnit', settings.tabSize);
          editor.setOption('tabSize', settings.tabSize);
        }
        if (settings.autoIndent !== undefined) {
          editor.setOption('autoIndent', settings.autoIndent);
        }
      }

      function insertText(text) {
        if (!editor) return;
        var selection = editor.getSelection();
        editor.replaceSelection(text);
        editor.focus();
      }

      function formatCode() {
        if (!editor) return;
        var content = editor.getValue();
        var mode = editor.getOption('mode');
        var formatted = content;
        try {
          if (typeof mode === 'object' && mode.json === true) {
            formatted = JSON.stringify(JSON.parse(content), null, editor.getOption('tabSize') || 2);
          }
        } catch(e) {
          // Ignore parse errors
        }
        if (formatted !== content) {
          isApplyingChange = true;
          editor.setValue(formatted);
          isApplyingChange = false;
          postMessage({ type: 'change', content: formatted });
        }
      }

      document.addEventListener('message', function(e) {
        // Reserved for older WebView compatibility
      });

      window.addEventListener('message', function(e) {
        // Reserved for window.postMessage
      });

      // Primary communication channel: injected JavaScript
      window.handleCommand = function(cmd) {
        try {
          var data = typeof cmd === 'string' ? JSON.parse(cmd) : cmd;
          switch(data.type) {
            case 'init':
              initEditor(data);
              break;
            case 'setContent':
              setContent(data.content);
              break;
            case 'setLanguage':
              setLanguage(data.language);
              break;
            case 'setSettings':
              setSettings(data.settings);
              break;
            case 'insertText':
              insertText(data.text);
              break;
            case 'format':
              formatCode();
              break;
          }
        } catch(err) {
          postMessage({ type: 'error', message: err.message });
        }
      };

      // Prevent default long-press menu
      document.addEventListener('selectionchange', function(e) {
        // Keep selection within editor
      });
    })();
  </script>
</body>
</html>`;
}

export const CODEMIRROR_HTML = buildHtml();
