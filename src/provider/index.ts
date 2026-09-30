import type { EngineProfile } from '../engines';
import createEnginePropertiesProvider from './ActivitiPropertiesProvider';

export function createEnginePropertiesModule(engine: EngineProfile) {
  return {
    __init__: ['enginePropertiesProvider'],
    enginePropertiesProvider: ['type', createEnginePropertiesProvider(engine)]
  };
}
