import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import activitiModdleDescriptor from 'activiti-bpmn-moddle/resources/activiti.json';
import { ActivitiPropertiesProviderModule } from './provider';
import {
  applyDocumentLocale,
  bindLocaleSwitch,
  getLocale,
  syncLocaleSwitch
} from './i18n/locale';
import { t, type MessageKey } from './i18n/messages';
import { createTranslateModule } from './i18n/translate';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
import './style.css';

type ZoomCanvas = {
  zoom: (type: string, auto?: string) => void;
};

function emptyDiagram() {
  const processName = t('processName');
  const startName = t('startEventName');
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:activiti="http://activiti.org/bpmn"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
             id="Definitions_new"
             targetNamespace="http://activiti.org/test">
  <process id="Process_1" name="${processName}" isExecutable="true">
    <startEvent id="StartEvent_1" name="${startName}" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <omgdc:Bounds x="180" y="160" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;
}

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

function applyChrome() {
  document.title = t('editorTitle');
  applyDocumentLocale();
  syncLocaleSwitch();

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n as MessageKey | undefined;
    if (key) {
      el.textContent = t(key);
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
    const key = el.dataset.i18nTitle as MessageKey | undefined;
    if (key) {
      el.title = t(key);
    }
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria as MessageKey | undefined;
    if (key) {
      el.setAttribute('aria-label', t(key));
    }
  });
}

function createModeler() {
  const canvas = document.getElementById('canvas');
  const properties = document.getElementById('properties');

  if (!canvas || !properties) {
    throw new Error('Missing #canvas or #properties container');
  }

  return new BpmnModeler({
    container: canvas,
    propertiesPanel: {
      parent: properties
    },
    additionalModules: [
      createTranslateModule(getLocale()),
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      ActivitiPropertiesProviderModule
    ],
    moddleExtensions: {
      activiti: activitiModdleDescriptor
    }
  });
}

async function openDiagram(modeler: BpmnModeler, xml: string, label: string) {
  try {
    const result = await modeler.importXML(xml);
    const canvas = modeler.get('canvas') as ZoomCanvas;
    canvas.zoom('fit-viewport', 'auto');
    const warningCount = Array.isArray(result.warnings) ? result.warnings.length : 0;
    setStatus(
      warningCount > 0
        ? t('openedWarnings', { label, count: warningCount })
        : t('opened', { label })
    );
  } catch (err) {
    console.error(err);
    setStatus(t('openFailed', { label }));
    window.alert(t('openFailedAlert', { message: (err as Error).message || String(err) }));
  }
}

async function main() {
  applyChrome();
  document.documentElement.dataset.ready = 'true';

  let modeler = createModeler();
  let diagramXml = emptyDiagram();
  let diagramLabel = 'sample.bpmn';

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
    diagramXml = xml;
    diagramLabel = file.name;
    await openDiagram(modeler, xml, file.name);
  });

  btnDownload.addEventListener('click', async () => {
    try {
      const { xml } = await modeler.saveXML({ format: true });
      if (!xml) {
        throw new Error('Empty XML');
      }
      diagramXml = xml;
      downloadText('diagram.bpmn', xml);
      setStatus(t('downloaded'));
    } catch (err) {
      console.error(err);
      setStatus(t('downloadFailed'));
      window.alert(t('exportFailed', { message: (err as Error).message || String(err) }));
    }
  });

  btnNew.addEventListener('click', async () => {
    const ok = window.confirm(t('confirmNew'));
    if (!ok) {
      return;
    }
    diagramXml = emptyDiagram();
    diagramLabel = t('newLabel');
    await openDiagram(modeler, diagramXml, diagramLabel);
  });

  btnFit.addEventListener('click', () => {
    const canvas = modeler.get('canvas') as ZoomCanvas;
    canvas.zoom('fit-viewport', 'auto');
    setStatus(t('fitted'));
  });

  bindLocaleSwitch(async () => {
    try {
      const saved = await modeler.saveXML({ format: true });
      if (saved.xml) {
        diagramXml = saved.xml;
      }
    } catch (err) {
      console.error(err);
    }
    modeler.destroy();
    applyChrome();
    modeler = createModeler();
    await openDiagram(modeler, diagramXml, diagramLabel);
  });

  try {
    const response = await fetch('/sample.bpmn');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    diagramXml = await response.text();
    diagramLabel = 'sample.bpmn';
    await openDiagram(modeler, diagramXml, diagramLabel);
  } catch (err) {
    console.warn('Failed to load sample, falling back to empty diagram', err);
    diagramXml = emptyDiagram();
    diagramLabel = t('newLabel');
    await openDiagram(modeler, diagramXml, diagramLabel);
  }
}

main().catch((err) => {
  console.error(err);
  setStatus(t('initFailed'));
  document.documentElement.dataset.ready = 'true';
});
