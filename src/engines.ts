import activitiDescriptor from 'activiti-bpmn-moddle/resources/activiti.json';

export type EngineId = 'camunda' | 'flowable' | 'activiti';

export interface EngineProfile {
  id: EngineId;
  label: string;
  prefix: string;
  uri: string;
  /** XML attribute used for the async checkbox. Camunda 7 uses asyncBefore. */
  asyncProperty: 'async' | 'asyncBefore';
}

type ModdleProperty = {
  name: string;
  isAttr?: boolean;
  type?: string;
  default?: boolean | string;
};

type ModdleType = {
  name: string;
  properties?: ModdleProperty[];
  [key: string]: unknown;
};

type ModdleDescriptor = {
  name: string;
  uri: string;
  prefix: string;
  types: ModdleType[];
  [key: string]: unknown;
};

export const ENGINES: Record<EngineId, EngineProfile> = {
  camunda: {
    id: 'camunda',
    label: 'Camunda',
    prefix: 'camunda',
    uri: 'http://camunda.org/schema/1.0/bpmn',
    asyncProperty: 'asyncBefore'
  },
  flowable: {
    id: 'flowable',
    label: 'Flowable',
    prefix: 'flowable',
    uri: 'http://flowable.org/bpmn',
    asyncProperty: 'async'
  },
  activiti: {
    id: 'activiti',
    label: 'Activiti',
    prefix: 'activiti',
    uri: 'http://activiti.org/bpmn',
    asyncProperty: 'async'
  }
};

export const ENGINE_ORDER: EngineId[] = ['camunda', 'flowable', 'activiti'];

export function engineFromParam(value: string | null): EngineProfile {
  if (value === 'flowable' || value === 'activiti' || value === 'camunda') {
    return ENGINES[value];
  }
  return ENGINES.camunda;
}

export function editorHref(engine: EngineProfile): string {
  return `editor.html?engine=${engine.id}`;
}

export function moddleDescriptorFor(engine: EngineProfile): ModdleDescriptor {
  const cloned = JSON.parse(
    JSON.stringify(activitiDescriptor).replaceAll('activiti:', `${engine.prefix}:`)
  ) as ModdleDescriptor;
  cloned.name = engine.label;
  cloned.uri = engine.uri;
  cloned.prefix = engine.prefix;

  if (engine.asyncProperty === 'asyncBefore') {
    const asyncCapable = cloned.types.find((type) => type.name === 'AsyncCapable');
    const properties = asyncCapable?.properties ?? [];
    if (!properties.some((property) => property.name === 'asyncBefore')) {
      properties.push({
        name: 'asyncBefore',
        isAttr: true,
        type: 'Boolean',
        default: false
      });
    }
  }

  return cloned;
}

/** Rewrite the Activiti sample so it uses this engine's namespace and attributes. */
export function adaptActivitiXml(xml: string, engine: EngineProfile): string {
  let next = xml
    .replaceAll(
      'xmlns:activiti="http://activiti.org/bpmn"',
      `xmlns:${engine.prefix}="${engine.uri}"`
    )
    .replaceAll('activiti:', `${engine.prefix}:`)
    .replaceAll('http://activiti.org/test', engine.uri);

  if (engine.asyncProperty === 'asyncBefore') {
    next = next.replaceAll(`${engine.prefix}:async=`, `${engine.prefix}:asyncBefore=`);
  }

  return next
    .replaceAll('Activiti BPMN Designer', `${engine.label} BPMN Editor`)
    .replaceAll('示例 Activiti', `示例 ${engine.label}`)
    .replaceAll('activiti 扩展', `${engine.prefix} 扩展`);
}

export function emptyDiagramXml(engine: EngineProfile, processName: string, startName: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xmlns:${engine.prefix}="${engine.uri}"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI"
             id="Definitions_new"
             targetNamespace="${engine.uri}">
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
