import { getLocale, type Locale } from './locale';

const messages = {
  en: {
    siteTitle: 'BPMN Editor',
    editorTitle: '{engine} · BPMN Editor',
    heroTitle: 'BPMN Editor',
    heroLead: 'A BPMN 2.0 modeler that runs in the browser.',
    featuresTitle: 'Model a process, then take the XML with you',
    featuresLead: 'No account. No server. The diagram never leaves this page.',
    featureModelTitle: 'Model',
    featureModelBody: 'Drop events, tasks, and gateways on the canvas, then edit their properties.',
    featureExportTitle: 'Open and download',
    featureExportBody: 'Import a local BPMN file, or download the diagram as XML when you are done.',
    featureExtTitle: 'Three engines',
    featureExtBody: 'Camunda, Flowable, and Activiti each open an editor that writes that engine’s extension attributes.',
    footer: 'A frontend BPMN modeler. Diagrams are standard BPMN 2.0 XML.',
    brandHome: 'bpmn editor home',
    navLabel: 'Primary',
    open: 'Open',
    openTitle: 'Open a local BPMN or XML file',
    download: 'Download',
    downloadTitle: 'Download the current diagram as BPMN XML',
    newDiagram: 'New',
    newTitle: 'Create a blank diagram',
    fit: 'Fit',
    fitTitle: 'Fit the diagram to the canvas',
    collapseProperties: 'Collapse properties',
    expandProperties: 'Expand properties',
    ready: 'Ready',
    opened: 'Opened {label}',
    openedWarnings: 'Opened {label} ({count} warnings)',
    openFailed: 'Could not open {label}',
    openFailedAlert: 'Could not open the diagram: {message}',
    downloaded: 'Downloaded diagram.bpmn',
    downloadFailed: 'Download failed',
    exportFailed: 'Export failed: {message}',
    confirmNew: 'Creating a new diagram clears the canvas. Continue?',
    newLabel: 'New diagram',
    fitted: 'Fitted to the canvas',
    initFailed: 'Failed to start the editor',
    processName: 'New process',
    startEventName: 'Start',
    editorHome: 'Back to the site'
  },
  zh: {
    siteTitle: 'BPMN 编辑器',
    editorTitle: '{engine} · BPMN 编辑器',
    heroTitle: 'BPMN 编辑器',
    heroLead: '在浏览器里使用的 BPMN 2.0 建模器。',
    featuresTitle: '画完流程，把 XML 带走',
    featuresLead: '没有账号，也没有服务器。流程图不会离开这个页面。',
    featureModelTitle: '建模',
    featureModelBody: '把事件、任务和网关拖到画布上，再编辑它们的属性。',
    featureExportTitle: '打开与下载',
    featureExportBody: '导入本地 BPMN 文件，或在完成后把流程图下载为 XML。',
    featureExtTitle: '三种引擎',
    featureExtBody: 'Camunda、Flowable 和 Activiti 各自打开对应的编辑器，写出该引擎的扩展属性。',
    footer: '纯前端 BPMN 建模器。流程图是标准的 BPMN 2.0 XML。',
    brandHome: 'bpmn editor 首页',
    navLabel: '主导航',
    open: '打开',
    openTitle: '打开本地 BPMN 或 XML 文件',
    download: '下载',
    downloadTitle: '把当前流程图下载为 BPMN XML',
    newDiagram: '新建',
    newTitle: '新建空白流程',
    fit: '适应画布',
    fitTitle: '让流程图适应画布',
    collapseProperties: '收起属性面板',
    expandProperties: '展开属性面板',
    ready: '就绪',
    opened: '已打开：{label}',
    openedWarnings: '已打开：{label}（{count} 条警告）',
    openFailed: '打开失败：{label}',
    openFailedAlert: '无法打开流程图：{message}',
    downloaded: '已下载 diagram.bpmn',
    downloadFailed: '下载失败',
    exportFailed: '导出失败：{message}',
    confirmNew: '新建将清空当前画布，是否继续？',
    newLabel: '新流程',
    fitted: '已适应画布',
    initFailed: '初始化失败',
    processName: '新流程',
    startEventName: '开始',
    editorHome: '返回官网'
  }
} as const;

export type MessageKey = keyof (typeof messages)['en'];

export function translateMessage(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const template: string = messages[locale][key];
  if (!vars) {
    return template;
  }
  return template.replace(/\{([^}]+)}/g, (_, name: string) => {
    const value = vars[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  return translateMessage(getLocale(), key, vars);
}
