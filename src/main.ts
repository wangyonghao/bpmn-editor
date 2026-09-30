import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import activitiModdleDescriptor from 'activiti-bpmn-moddle/resources/activiti.json';
import { ActivitiPropertiesProviderModule } from './provider';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import './style.css';

const EMPTY_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:activiti="http://activiti.org/bpmn"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
             id="Definitions_new"
             targetNamespace="http://activiti.org/test">
  <process id="Process_1" name="新流程" isExecutable="true">
    <startEvent id="StartEvent_1" name="开始" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <omgdc:Bounds x="180" y="160" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

function setStatus(message: string) {
  const el = document.getElementById('status');
  if (el) {
    el.textContent = message;
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function createModeler() {
  const canvas = document.getElementById('canvas');
  const properties = document.getElementById('properties');

  if (!canvas || !properties) {
    throw new Error('Missing #canvas or #properties container');
  }

  const modeler = new BpmnModeler({
    container: canvas,
    propertiesPanel: {
      parent: properties
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ActivitiPropertiesProviderModule
    ],
    moddleExtensions: {
      activiti: activitiModdleDescriptor
    }
  });

  return modeler;
}

async function openDiagram(modeler: BpmnModeler, xml: string, label: string) {
  try {
    const result = await modeler.importXML(xml);
    const canvas = modeler.get('canvas');
    canvas.zoom('fit-viewport', 'auto');
    const warningCount = Array.isArray(result.warnings) ? result.warnings.length : 0;
    setStatus(
      warningCount > 0 ? `已打开：${label}（${warningCount} 条警告）` : `已打开：${label}`
    );
  } catch (err) {
    console.error(err);
    setStatus(`打开失败：${label}`);
    window.alert(`无法打开流程图：${(err as Error).message || err}`);
  }
}

async function main() {
  const modeler = await createModeler();

  const btnOpen = document.getElementById('btn-open') as HTMLButtonElement;
  const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
  const btnNew = document.getElementById('btn-new') as HTMLButtonElement;
  const btnFit = document.getElementById('btn-fit') as HTMLButtonElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;

  btnOpen.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) {
      return;
    }
    const xml = await file.text();
    await openDiagram(modeler, xml, file.name);
  });

  btnDownload.addEventListener('click', async () => {
    try {
      const { xml } = await modeler.saveXML({ format: true });
      if (!xml) {
        throw new Error('Empty XML');
      }
      downloadText('diagram.bpmn', xml);
      setStatus('已下载 diagram.bpmn');
    } catch (err) {
      console.error(err);
      setStatus('下载失败');
      window.alert(`导出失败：${(err as Error).message || err}`);
    }
  });

  btnNew.addEventListener('click', async () => {
    const ok = window.confirm('新建将清空当前画布，是否继续？');
    if (!ok) {
      return;
    }
    await openDiagram(modeler, EMPTY_DIAGRAM, '新流程');
  });

  btnFit.addEventListener('click', () => {
    const canvas = modeler.get('canvas');
    canvas.zoom('fit-viewport', 'auto');
    setStatus('已适应画布');
  });

  try {
    const response = await fetch('/sample.bpmn');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const xml = await response.text();
    await openDiagram(modeler, xml, 'sample.bpmn');
  } catch (err) {
    console.warn('Failed to load sample, falling back to empty diagram', err);
    await openDiagram(modeler, EMPTY_DIAGRAM, '新流程');
  }
}

main().catch((err) => {
  console.error(err);
  setStatus('初始化失败');
});
