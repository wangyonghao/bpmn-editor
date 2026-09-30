import { getActivitiEntries } from './ActivitiProps';

const LOW_PRIORITY = 500;

type Translate = (text: string) => string;

/**
 * Adds an "Activiti" group to the properties panel for common Activiti extension attributes.
 */
export default class ActivitiPropertiesProvider {
  static $inject = ['propertiesPanel', 'translate'];

  constructor(propertiesPanel: { registerProvider: (priority: number, provider: unknown) => void }, translate: Translate) {
    propertiesPanel.registerProvider(LOW_PRIORITY, this);
    this._translate = translate;
  }

  private _translate: Translate;

  getGroups(element: unknown) {
    return (groups: Array<Record<string, unknown>>) => {
      groups.push({
        id: 'activiti',
        label: this._translate('Activiti'),
        entries: getActivitiEntries(element as never),
        shouldOpen: true
      });

      return groups;
    };
  }
}
