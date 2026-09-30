/// <reference types="vite/client" />

declare module 'bpmn-js/lib/Modeler' {
  export default class BpmnModeler {
    constructor(options?: Record<string, unknown>);
    importXML(xml: string): Promise<{ warnings: unknown[] }>;
    saveXML(options?: { format?: boolean }): Promise<{ xml?: string }>;
    get(name: string): any;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
  }
}

declare module 'bpmn-js-properties-panel' {
  export const BpmnPropertiesPanelModule: unknown;
  export const BpmnPropertiesProviderModule: unknown;
  export function useService<T = any>(name: string): T;
}

declare module 'bpmn-js/lib/util/ModelUtil' {
  export function is(element: unknown, type: string): boolean;
}

declare module '@bpmn-io/properties-panel' {
  export const TextFieldEntry: any;
  export const CheckboxEntry: any;
  export const TextAreaEntry: any;
  export function isTextFieldEntryEdited(node: unknown): boolean;
  export function isCheckboxEntryEdited(node: unknown): boolean;
  export function isTextAreaEntryEdited(node: unknown): boolean;
}

declare module 'activiti-bpmn-moddle/resources/activiti.json' {
  const descriptor: Record<string, unknown>;
  export default descriptor;
}

declare module '*.bpmn?raw' {
  const content: string;
  export default content;
}
