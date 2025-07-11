import { DI, inject } from 'aurelia';
import { IEnvService, EnvServiceToken } from "./env-service.js";
import { ILogService, LogServiceToken } from "./log-service.js";

export interface IAsset {
  name: string;
  exchange: string;
  exchangeName: string;
  percentage: number;
  apiUrl: string;
}

interface IExchange {
  name: string;
  apiUrl?: string;
  [key: string]: unknown;
}

interface IAssetConfig {
  name: string;
  exchange: string;
  percentage?: number;
  [key: string]: unknown;
}

interface IBatchConfig {
  exchanges?: IExchange[];
  assets?: IAssetConfig[];
  [key: string]: unknown;
}

interface IConfig {
  batchConfig?: IBatchConfig;
  [key: string]: unknown;
}

// Define the interface
export interface IAssetsConfigService {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  logFileName: string;
  telegramBotToken: string;
  telegramChatId: string;
  getAssets(): Promise<IAsset[]>;
}

// Create DI token for the interface - using a different name to avoid conflict
export const AssetsConfigServiceToken = DI.createInterface<IAssetsConfigService>('IAssetsConfigService');

@inject(EnvServiceToken, LogServiceToken)
export class AssetsConfigService implements IAssetsConfigService {

  private _apiKey: string;
  private _apiSecret: string;
  private _baseUrl: string;
  private _telegramBotToken: string;
  private _telegramChatId: string;
  private _assets: IAsset[];

  constructor(
    private envService: IEnvService,
    private logService: ILogService) {

    this._apiKey = this.envService.get('API_KEY');
    this._apiSecret = this.envService.get('API_SECRET');
    this._baseUrl = this.envService.get('BASE_URL') || 'https://api.default.com';
    this._telegramBotToken = this.envService.get('TELEGRAM_BOT_TOKEN');
    this._telegramChatId = this.envService.get('TELEGRAM_CHAT_ID');
  }
  logFileName: string;
  public get assets(): IAsset[] {
    return this._assets;
  }

  public get telegramBotToken(): string {
    return this.telegramBotToken;
  }
  public set telegramBotToken(value: string) {
    this.telegramBotToken = value;
  }

  public get telegramChatId(): string {
    return this.telegramChatId;
  }
  public set telegramChatId(value: string) {
    this.telegramChatId = value;
  }

  get apiKey() {
    return this._apiKey;
  }
  set apiKey(value) {
    this._apiKey = value;
  }

  get apiSecret() {
    return this._apiSecret;
  }
  set apiSecret(value) {
    this._apiSecret = value;
  }

  get baseUrl() {
    return this._baseUrl;
  }
  set baseUrl(value) {
    this._baseUrl = value;
  }

  async getAssets(): Promise<IAsset[]> {
    if (!this._assets) {
      return this.fetchConfig();
    }
    return this._assets;
  }

  private async fetchConfig(): Promise<IAsset[]> {
    try {
      const response = await fetch('/config.json');
      const config = await response.json();
      const exchanges = (config.batchConfig?.exchanges ?? []);
      const exchangeMap = Object.fromEntries(exchanges.map((e: { name: string; }) => [e.name, e]));

      return this._assets = ((config as IConfig).batchConfig?.assets ?? []).map((asset: IAssetConfig): IAsset => ({
        name: asset.name,
        exchange: asset.exchange,
        exchangeName: asset.exchange,
        percentage: asset.percentage ?? 15,
        apiUrl: exchangeMap[asset.exchange]?.apiUrl || ''
      }));
    } catch (error) {
      const errMessage = "";
      if (error instanceof Error) {

        error.message = error.message
          .replace(this.apiKey || '', '[REDACTED_API_KEY]')
          .replace(this.apiSecret || '', '[REDACTED_API_SECRET]')
          // .replace(this.vpnIP || '', '[REDACTED_VPN_IP]')
          .replace(this.telegramBotToken || '', '[REDACTED_BOT_TOKEN]');
        error.message = `Error fetching config: ${errMessage}`;
      }
      else {
        const err = `Error fetching config: ${String(error)}`;
        this.logService.logError(err);
        return this._assets = [];
      }

      this.logService.logError(error);
      return this._assets = [];
    }
  }
}