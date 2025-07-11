import { DI } from 'aurelia';

export interface IEnvService {
  get(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
}

export const EnvServiceToken = DI.createInterface<IEnvService>('IEnvService');

export class EnvService implements IEnvService {
  constructor() { }

  get(key: string): string | undefined {
    // In Vite/browser environment, use import.meta.env
    // This avoids the dotenv browser compatibility issues
    return ((import.meta as unknown) as { env: Record<string, string> }).env[key];
  }

  getNumber(key: string): number | undefined {
    const value = this.get(key);
    return value ? parseFloat(value) : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.get(key);
    return value ? value.toLowerCase() === 'true' : undefined;
  }
}