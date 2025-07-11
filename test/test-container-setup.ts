import { vi } from 'vitest';
import { DI, IContainer, Registration } from 'aurelia';
import {
  IExchangeApiService, ExchangeApiServiceToken,
  ILogService, LogServiceToken,
  ITelegramService, TelegramServiceToken,
  AssetsConfigServiceToken, IAssetsConfigService,
  IEnvService, EnvServiceToken
} from '../src/services/index.js';

export interface TestMocks {
  exchangeApi?: Partial<IExchangeApiService>;
  logService?: Partial<ILogService>;
  telegramService?: Partial<ITelegramService>;
  assetsConfig?: Partial<IAssetsConfigService>;
  envService?: Partial<IEnvService>;
}

export function createTestContainer(mocks: TestMocks = {}): IContainer {
  const container = DI.createContainer();

  // Default mocks that can be overridden
  const defaultMocks = {
    exchangeApi: {
      createMarketSellOrder: vi.fn(),
      fetchPrice: vi.fn()
    },
    logService: {
      log: vi.fn(),
      logError: vi.fn(),
      logReport: vi.fn()
    },
    telegramService: {
      sendTelegramMessage: vi.fn(),
      sendTelegramErrorMessage: vi.fn()
    },
    assetsConfig: {
      getAssets: vi.fn().mockResolvedValue([]),
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      baseUrl: 'https://test-api.com',
      logFileName: 'test.log',
      telegramBotToken: 'test-token',
      telegramChatId: 'test-chat'
    },
    envService: {
      get: vi.fn(),
      getNumber: vi.fn(),
      getBoolean: vi.fn()
    }
  };

  // Merge provided mocks with defaults
  const finalMocks = {
    exchangeApi: { ...defaultMocks.exchangeApi, ...mocks.exchangeApi },
    logService: { ...defaultMocks.logService, ...mocks.logService },
    telegramService: { ...defaultMocks.telegramService, ...mocks.telegramService },
    assetsConfig: { ...defaultMocks.assetsConfig, ...mocks.assetsConfig },
    envService: { ...defaultMocks.envService, ...mocks.envService }
  };

  // Register mocks using the same tokens as main.ts
  container.register(
    Registration.instance(ExchangeApiServiceToken, finalMocks.exchangeApi as IExchangeApiService),
    Registration.instance(LogServiceToken, finalMocks.logService as ILogService),
    Registration.instance(TelegramServiceToken, finalMocks.telegramService as ITelegramService),
    Registration.instance(AssetsConfigServiceToken, finalMocks.assetsConfig as IAssetsConfigService),
    Registration.instance(EnvServiceToken, finalMocks.envService as IEnvService)
  );

  return container;
}

export function getMocksFromContainer(container: IContainer): TestMocks {
  return {
    exchangeApi: container.get(ExchangeApiServiceToken),
    logService: container.get(LogServiceToken),
    telegramService: container.get(TelegramServiceToken),
    assetsConfig: container.get(AssetsConfigServiceToken),
    envService: container.get(EnvServiceToken)
  };
}
