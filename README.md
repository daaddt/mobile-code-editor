# 移动代码编辑器 (Mobile Code Editor)

一个基于 React Native + Expo 构建的移动端代码/文本编辑器，支持多种编程语言语法高亮，可通过 GitHub Actions 自动构建 Android APK 安装包。

## 功能特性

- 代码语法高亮：JavaScript / TypeScript / Python / HTML / CSS / JSON / Markdown / XML / SQL / C/C++ / Java / Shell / YAML / Go / Rust
- 深色 / 浅色主题切换
- 自定义字号、Tab 宽度、行号、自动换行、自动缩进
- 文件管理：新建、重命名、删除、导入、导出
- 数据本地持久化（AsyncStorage）
- 底部标签栏导航

## 技术栈

| 技术 | 说明 |
|------|------|
| React Native 0.86 | 跨平台移动框架 |
| Expo SDK 57 | 开发与构建工具链 |
| CodeMirror 5 | 代码编辑器引擎（WebView 嵌入） |
| React Navigation 7 | 导航与路由 |
| Zustand | 轻量状态管理 |
| expo-file-system | 文件读写 |
| expo-document-picker | 文件导入 |
| expo-sharing | 文件导出/分享 |

## 本地开发

### 环境要求

- Node.js >= 20.19
- npm 或 yarn
- Android Studio（用于 Android 模拟器）

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npx expo start
```

启动后可以：
- 按 `a` 在 Android 模拟器中运行
- 用 Expo Go 扫描二维码在真机上运行
- 按 `w` 在浏览器中运行

## 构建 APK

### 方式一：GitHub Actions（推荐）

本项目已配置 GitHub Actions 工作流，推送到 `main` 分支或创建 `v*` 标签时自动构建 APK。

**步骤：**

1. 将本项目推送到 GitHub 仓库
2. 推送到 `main` 分支 → 自动构建 APK
3. 在 GitHub 仓库的 **Actions** 标签页查看构建进度
4. 构建完成后，在 Artifacts 区域下载 APK 文件

**通过 Tag 发布 Release：**

```bash
git tag v1.0.0
git push origin v1.0.0
```

这会触发构建并自动创建 GitHub Release，附带 APK 文件。

### 方式二：本地构建

```bash
# 生成原生 Android 项目
npx expo prebuild -p android

# 构建 Debug APK
cd android && ./gradlew assembleDebug

# APK 输出路径:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 方式三：EAS Build（云端构建）

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
eas login

# 构建预览版 APK
eas build -p android --profile preview
```

## 项目结构

```
mobile-code-editor/
├── .github/workflows/
│   └── build-android.yml      # GitHub Actions APK 构建工作流
├── src/
│   ├── components/
│   │   ├── CodeEditor.tsx     # 代码编辑器组件（WebView + CodeMirror）
│   │   └── codemirror-html.ts # CodeMirror HTML 模板
│   ├── screens/
│   │   ├── EditorScreen.tsx   # 编辑器界面
│   │   ├── FilesScreen.tsx   # 文件管理界面
│   │   └── SettingsScreen.tsx # 设置界面
│   ├── store/
│   │   └── useStore.ts        # Zustand 状态管理
│   ├── types/
│   │   └── index.ts           # 类型定义
│   └── utils/
│       └── fileSystem.ts     # 文件系统工具
├── App.tsx                    # 应用入口 + 导航配置
├── app.json                   # Expo 配置
├── eas.json                   # EAS Build 配置
├── index.ts                   # 注册根组件
├── package.json
└── tsconfig.json
```

## 自定义配置

### 修改应用名称

编辑 `app.json` 中的 `name` 字段：
```json
{
  "expo": {
    "name": "你的应用名"
  }
}
```

### 修改 Android 包名

编辑 `app.json` 中的 `android.package` 字段：
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### 添加更多语言支持

在 `src/components/codemirror-html.ts` 中添加 CodeMirror 语言模式脚本和对应的 mode 映射。

在 `src/utils/fileSystem.ts` 的 `LANGUAGE_OPTIONS` 数组中添加新语言选项。

## 签名说明

当前 GitHub Actions 工作流使用 debug 签名构建 APK，适合开发和测试使用。

如需发布到应用商店，需要配置正式签名：

1. 生成 release keystore：
   ```bash
   keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
   ```

2. 将 keystore 文件转为 base64 并添加为 GitHub Secret

3. 在工作流中配置签名参数

## License

MIT
