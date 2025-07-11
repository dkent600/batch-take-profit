import * as dotenv from 'dotenv';

export interface IEnvService {
  get(key: string): string | undefined;
  getNumber(key: string): number | undefined;
  getBoolean(key: string): boolean | undefined;
}

export class EnvService implements IEnvService {
  private env: Record<string, string>;

  constructor() {
    dotenv.config();
    this.env = process.env;
  }

  get(key: string): string | undefined {
    return this.env[key];
  }

  getNumber(key: string): number | undefined {
    const value = this.env[key];
    return value ? parseFloat(value) : undefined;
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.env[key];
    return value ? value.toLowerCase() === 'true' : undefined;
  }
}