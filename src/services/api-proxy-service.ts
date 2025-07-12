import { DI } from 'aurelia';

export interface IApiProxyService {
  getProxyUrl(baseUrl: string, path: string): string;
  getDirectUrl(baseUrl: string, path: string): string;
}

export const ApiProxyServiceToken = DI.createInterface<IApiProxyService>('IApiProxyService');

export class ApiProxyService implements IApiProxyService {

  /**
   * Get the proxied URL for development or direct URL for production
   * @param baseUrl The base API URL (e.g., 'https://api.mexc.com')
   * @param path The API path (e.g., '/api/v3/time')
   * @returns The appropriate URL to use
   */
  getProxyUrl(baseUrl: string, path: string): string {
    // In development, use the Vite proxy
    if ((import.meta as any).env.DEV) {
      // Extract domain from baseUrl
      const domain = baseUrl.replace(/^https?:\/\//, '');
      return `/proxy/${domain}${path}`;
    }

    // In production, use direct URL
    return this.getDirectUrl(baseUrl, path);
  }

  /**
   * Get direct URL (for production use)
   * @param baseUrl The base API URL
   * @param path The API path
   * @returns The direct URL
   */
  getDirectUrl(baseUrl: string, path: string): string {
    return `${baseUrl}${path}`;
  }
}
