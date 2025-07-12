import { DI } from 'aurelia';

export interface IEnvService {
  init(): Promise<void>;
  get(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
}

export const EnvServiceToken = DI.createInterface<IEnvService>('IEnvService');

export class EnvService implements IEnvService {
  private config: any = {};

  constructor() {
    // No async loading in constructor
  }

  async init(): Promise<void> {
    await this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      // Try to load local config first
      const response = await fetch('/config.local.json');
      if (response.ok) {
        this.config = await response.json();
        return;
      }
    } catch (error) {
      console.warn('Local config not found, falling back to public config');
    }
  }

  get(key: string): string | undefined {
    // Support dot notation for nested keys like "mexc.apiKey"
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return undefined;
      }
    }

    return typeof value === 'string' ? value : undefined;
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