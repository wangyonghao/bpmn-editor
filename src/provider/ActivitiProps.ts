import { html } from 'htm/preact';
import {
  TextFieldEntry,
  CheckboxEntry,
  TextAreaEntry,
  isTextFieldEntryEdited,
  isCheckboxEntryEdited,
  isTextAreaEntryEdited
} from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import { is } from 'bpmn-js/lib/util/ModelUtil';

type DiagramElement = {
  businessObject: Record<string, unknown> & {
    get?: (name: string) => unknown;
    documentation?: Array<{ text?: string }>;
  };
};

function getBo(element: DiagramElement) {
  return element.businessObject;
}

function TextProp(props: {
  element: DiagramElement;
  id: string;
  label: string;
  description?: string;
  property: string;
}) {
  const { element, id, label, description, property } = props;
  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');

  const getValue = () => {
    const bo = getBo(element);
    const value = bo.get ? bo.get(property) : bo[property];
    return (value as string) ?? '';
  };

  const setValue = (value: string) => {
    modeling.updateProperties(element, {
      [property]: value || undefined
    });
  };

  return html`<${TextFieldEntry}
    id=${id}
    element=${element}
    label=${translate(label)}
    description=${description ? translate(description) : undefined}
    getValue=${getValue}
    setValue=${setValue}
    debounce=${debounce}
  />`;
}

function CheckboxProp(props: {
  element: DiagramElement;
  id: string;
  label: string;
  property: string;
}) {
  const { element, id, label, property } = props;
  const modeling = useService('modeling');
  const translate = useService('translate');

  const getValue = () => {
    const bo = getBo(element);
    const value = bo.get ? bo.get(property) : bo[property];
    return !!value;
  };

  const setValue = (value: boolean) => {
    modeling.updateProperties(element, {
      [property]: value || undefined
    });
  };

  return html`<${CheckboxEntry}
    id=${id}
    element=${element}
    label=${translate(label)}
    getValue=${getValue}
    setValue=${setValue}
  />`;
}

function DocumentationProp(props: { element: DiagramElement; id: string }) {
  const { element, id } = props;
  const modeling = useService('modeling');
  const debounce = useService('debounceInput');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');

  const getValue = () => {
    const bo = getBo(element);
    const docs = (bo.get ? bo.get('documentation') : bo.documentation) as
      | Array<{ text?: string }>
      | undefined;
    return docs?.[0]?.text ?? '';
  };

  const setValue = (value: string) => {
    const bo = getBo(element);
    const existing = (bo.get ? bo.get('documentation') : bo.documentation) as
      | Array<{ text?: string }>
      | undefined;

    if (!value) {
      modeling.updateProperties(element, { documentation: undefined });
      return;
    }

    if (existing?.[0]) {
      modeling.updateModdleProperties(element, existing[0], { text: value });
      return;
    }

    const documentation = bpmnFactory.create('bpmn:Documentation', { text: value });
    modeling.updateProperties(element, { documentation: [documentation] });
  };

  return html`<${TextAreaEntry}
    id=${id}
    element=${element}
    label=${translate('Documentation')}
    getValue=${getValue}
    setValue=${setValue}
    debounce=${debounce}
    rows=${3}
  />`;
}

function createTextEntry(
  id: string,
  element: DiagramElement,
  label: string,
  property: string,
  description?: string
) {
  return {
    id,
    element,
    component: function ActivitiTextEntry(entryProps: { element: DiagramElement; id: string }) {
      return html`<${TextProp}
        element=${entryProps.element}
        id=${entryProps.id}
        label=${label}
        description=${description}
        property=${property}
      />`;
    },
    isEdited: isTextFieldEntryEdited
  };
}

function createCheckboxEntry(
  id: string,
  element: DiagramElement,
  label: string,
  property: string
) {
  return {
    id,
    element,
    component: function ActivitiCheckboxEntry(entryProps: {
      element: DiagramElement;
      id: string;
    }) {
      return html`<${CheckboxProp}
        element=${entryProps.element}
        id=${entryProps.id}
        label=${label}
        property=${property}
      />`;
    },
    isEdited: isCheckboxEntryEdited
  };
}

export function getActivitiEntries(element: DiagramElement) {
  const entries: unknown[] = [];

  entries.push({
    id: 'activiti-documentation',
    element,
    component: DocumentationProp,
    isEdited: isTextAreaEntryEdited
  });

  if (is(element, 'bpmn:UserTask')) {
    entries.push(
      createTextEntry('activiti-assignee', element, 'Assignee', 'assignee', 'activiti:assignee'),
      createTextEntry(
        'activiti-candidateUsers',
        element,
        'Candidate Users',
        'candidateUsers',
        'Comma-separated user ids'
      ),
      createTextEntry(
        'activiti-candidateGroups',
        element,
        'Candidate Groups',
        'candidateGroups',
        'Comma-separated group ids'
      ),
      createTextEntry('activiti-formKey', element, 'Form Key', 'formKey', 'activiti:formKey'),
      createTextEntry('activiti-dueDate', element, 'Due Date', 'dueDate'),
      createTextEntry('activiti-priority', element, 'Priority', 'priority')
    );
  }

  if (is(element, 'bpmn:StartEvent')) {
    entries.push(
      createTextEntry('activiti-initiator', element, 'Initiator', 'initiator'),
      createTextEntry('activiti-formKey', element, 'Form Key', 'formKey', 'activiti:formKey')
    );
  }

  if (is(element, 'bpmn:ServiceTask')) {
    entries.push(
      createTextEntry('activiti-class', element, 'Java Class', 'class', 'activiti:class'),
      createTextEntry(
        'activiti-delegateExpression',
        element,
        'Delegate Expression',
        'delegateExpression'
      ),
      createTextEntry('activiti-expression', element, 'Expression', 'expression')
    );
  }

  if (
    is(element, 'bpmn:Activity') ||
    is(element, 'bpmn:Gateway') ||
    is(element, 'bpmn:Event')
  ) {
    entries.push(createCheckboxEntry('activiti-async', element, 'Async', 'async'));
  }

  return entries;
}
