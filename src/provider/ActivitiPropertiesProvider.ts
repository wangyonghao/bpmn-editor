import type { EngineProfile } from '../engines';
import { getActivitiEntries } from './ActivitiProps';

const LOW_PRIORITY = 500;

type Translate = (text: string) => string;

/**
 * Adds an engine-specific group for the extension attributes that engine reads.
 */
export default function createEnginePropertiesProvider(engine: EngineProfile) {
  return class EnginePropertiesProvider {
    static $inject = ['propertiesPanel', 'translate'];

    constructor(
      propertiesPanel: { registerProvider: (priority: number, provider: unknown) => void },
      translate: Translate
    ) {
      propertiesPanel.registerProvider(LOW_PRIORITY, this);
      this._translate = translate;
    }

    private _translate: Translate;

    getGroups(element: unknown) {
      return (groups: Array<Record<string, unknown>>) => {
        groups.push({
          id: engine.id,
          label: this._translate(engine.label),
          entries: getActivitiEntries(element as never, engine),
          shouldOpen: true
        });

        return groups;
      };
    }
  };
}
