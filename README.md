# Activiti BPMN 在线设计器（前端 MVP）

纯前端的 Activiti BPMN 流程设计 / 查看原型，基于 `bpmn-js`，无需后端。

## 功能

- **打开**：通过文件选择器导入本地 `.bpmn` / `.xml`
- **查看**：画布缩放、平移；工具栏「适应画布」
- **编辑**：左侧/默认 palette 拖拽元素、连线
- **属性面板**：选中元素后在右侧编辑 id、name、documentation，以及常见 Activiti 扩展（`assignee`、`candidateUsers`、`candidateGroups`、`formKey`、`async` 等）
- **下载**：导出当前图为 BPMN XML
- **新建**：清空为带开始事件的空白流程
- **示例**：首次打开自动加载 `public/sample.bpmn`（含 `activiti:` 扩展）

## 快速开始

```bash
cd activiti-bpmn-designer
npm install
npm run dev
```

浏览器访问终端提示的本地地址（默认 `http://localhost:5173/`）。

生产构建：

```bash
npm run build
npm run preview
```

## 技术栈

| 包 | 用途 |
| --- | --- |
| Vite + TypeScript | 构建与开发服务器 |
| bpmn-js | BPMN 建模 / 画布 |
| bpmn-js-properties-panel | 属性面板壳 + 通用 BPMN 属性 |
| @bpmn-io/properties-panel | 属性面板 UI 组件 |
| activiti-bpmn-moddle | `activiti:` 命名空间 moddle 描述 |
| htm | 自定义 Activiti 属性条目（Preact 模板） |

自定义代码位于 `src/provider/`，向属性面板增加 **Activiti** 分组。

## 目录结构

```
activiti-bpmn-designer/
├── public/sample.bpmn          # 默认示例流程
├── src/
│   ├── main.ts                 # 应用入口、工具栏逻辑
│   ├── style.css               # 布局样式
│   ├── provider/               # Activiti 属性面板扩展
│   └── vite-env.d.ts
├── index.html
├── package.json
└── README.md
```

## 已知限制

- 仅覆盖常用 Activiti 扩展字段；监听器、表单字段、多实例、连接器等高级扩展未做成完整表单 UI（XML 中已有内容一般可经 moddle 保留往返）。
- 属性面板文案以英文标签为主（工具栏为中文）；可按需继续做 i18n。
- 无后端、无鉴权、无协同；所有数据仅在浏览器本地。

## 许可

示例原型代码可按项目需要自行使用。`bpmn-js` 等依赖遵循各自开源许可。
