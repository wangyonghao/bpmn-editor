import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import {
  adaptActivitiXml,
  emptyDiagramXml,
  engineFromParam,
  moddleDescriptorFor
} from './engines';
import { createEnginePropertiesModule } from './provider';
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
  resized: () => void;
};

const engine = engineFromParam(new URLSearchParams(window.location.search).get('engine'));

function emptyDiagram() {
  return emptyDiagramXml(engine, t('processName'), t('startEventName'));
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
  document.title = t('editorTitle', { engine: engine.label });
  const engineLabel = document.getElementById('engine-name');
  if (engineLabel) {
    engineLabel.textContent = engine.label;
  }
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

  syncPropertiesToggle();
}

function syncPropertiesToggle() {
  const dock = document.getElementById('properties-dock');
  const button = document.getElementById('btn-toggle-properties');
  if (!dock || !button) {
    return;
  }
  const expanded = !dock.classList.contains('is-collapsed');
  button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const label = t(expanded ? 'collapseProperties' : 'expandProperties');
  button.title = label;
  button.setAttribute('aria-label', label);
}

function bindPropertiesToggle(getModeler: () => BpmnModeler) {
  const dock = document.getElementById('properties-dock');
  const button = document.getElementById('btn-toggle-properties');
  if (!dock || !button) {
    return;
  }

  let resizeUntil = 0;
  let resizing = false;

  const resizeCanvas = () => {
    try {
      const canvas = getModeler().get('canvas') as ZoomCanvas;
      canvas.resized();
    } catch {
      // The modeler is recreated during a language switch.
    }
  };

  const followResize = () => {
    resizeUntil = performance.now() + 900;
    if (resizing) {
      return;
    }
    resizing = true;
    const tick = () => {
      resizeCanvas();
      if (performance.now() < resizeUntil) {
        requestAnimationFrame(tick);
      } else {
        resizing = false;
      }
    };
    requestAnimationFrame(tick);
  };

  button.addEventListener('click', () => {
    dock.classList.toggle('is-collapsed');
    syncPropertiesToggle();
    followResize();
  });

  dock.addEventListener('transitionend', (event) => {
    if (event.target === dock && event.propertyName === 'width') {
      resizeCanvas();
    }
  });

  syncPropertiesToggle();
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
      createEnginePropertiesModule(engine)
    ],
    moddleExtensions: {
      [engine.prefix]: moddleDescriptorFor(engine)
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

  bindPropertiesToggle(() => modeler);

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
    diagramXml = adaptActivitiXml(await response.text(), engine);
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
