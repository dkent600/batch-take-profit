import { vi } from 'vitest';
import { DI, IContainer, Registration } from 'aurelia';
import {
  ILogService, LogServiceToken,
  ITelegramService, TelegramServiceToken,
  AssetsConfigServiceToken, IAssetsConfigService,
  IEnvService, EnvServiceToken
} from '../src/services/index.js';
import { IAssetExchangeService } from '../src/services/exchange-service.js';
import { AssetExchangeApiServiceToken } from '../src/services/exchange-apis/exchange-api-service.js';

export interface TestMocks {
  logService?: Partial<ILogService>;
  telegramService?: Partial<ITelegramService>;
  assetsConfig?: Partial<IAssetsConfigService>;
  envService?: Partial<IEnvService>;
  assetExchangeService?: Partial<IAssetExchangeService>;
}

export function createTestContainer(mocks: TestMocks = {}): IContainer {
  const container = DI.createContainer();

  // Default mocks that can be overridden
  const defaultMocks = {
    assetExchangeService: {
      createSellOrder: vi.fn(),
      fetchPrice: vi.fn(),
      fetchBalance: vi.fn()
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
      telegramChatId: 'test-chat',
      serviceUrl: 'http://localhost:3000'
    },
    envService: {
      get: vi.fn(),
      getNumber: vi.fn(),
      getBoolean: vi.fn()
    }
  };

  // Merge provided mocks with defaults
  const finalMocks = {
    logService: { ...defaultMocks.logService, ...mocks.logService },
    telegramService: { ...defaultMocks.telegramService, ...mocks.telegramService },
    assetsConfig: { ...defaultMocks.assetsConfig, ...mocks.assetsConfig },
    envService: { ...defaultMocks.envService, ...mocks.envService },
    assetExchangeService: { ...defaultMocks.assetExchangeService, ...mocks.assetExchangeService }
  };

  // Register mocks using the same tokens as main.ts
  container.register(
    Registration.instance(LogServiceToken, finalMocks.logService as ILogService),
    Registration.instance(TelegramServiceToken, finalMocks.telegramService as ITelegramService),
    Registration.instance(AssetsConfigServiceToken, finalMocks.assetsConfig as IAssetsConfigService),
    Registration.instance(EnvServiceToken, finalMocks.envService as IEnvService),
    Registration.instance(AssetExchangeApiServiceToken, finalMocks.assetExchangeService as IAssetExchangeService)
  );

  return container;
}

export function getMocksFromContainer(container: IContainer): TestMocks {
  return {
    logService: container.get(LogServiceToken),
    telegramService: container.get(TelegramServiceToken),
    assetsConfig: container.get(AssetsConfigServiceToken),
    envService: container.get(EnvServiceToken),
    assetExchangeService: container.get(AssetExchangeApiServiceToken)
  };
}
