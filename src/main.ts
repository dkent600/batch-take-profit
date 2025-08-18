import { Aurelia, ILogger, Registration } from 'aurelia';
import { App } from './pages/app/app.js';
import './pages/app/app.css';
import { AssetList } from './pages/asset-list/asset-list.js';

// MS FAST imports
import {
  allComponents,
  provideFASTDesignSystem
} from '@microsoft/fast-components';
// Replace old design-tokens import with new modular system
import { initializeDesignSystem, getDesignSystemStatus } from './design-system/index.js';
import { testFASTComponents } from './fast-test.js';
import { installGlobalThemeSwitcher } from './theme-switcher.js';
import {
  TelegramService, TelegramServiceToken,
  AssetsConfigService, AssetsConfigServiceToken,
  EnvService, EnvServiceToken,
  AssetExchangeApiService,
  AssetExchangeApiServiceToken
} from './services/index.js';
import { AssetsStore, AssetsStoreToken } from './stores/assets-store.js';
import { OrdersStoreToken, OrdersStore } from './stores/orders-store.js';
import { RequestQueueService, RequestQueueServiceToken } from './services/request-queue-service.js';
import { OrderConfirmationModal } from './pages/asset-list/order-confirmation-modal.js';

let logger: ILogger;

async function startApp() {
  // Initialize MS FAST Design System
  provideFASTDesignSystem()
    .register(allComponents);

  // Initialize design system (default or custom based on config)
  await initializeDesignSystem();

  // Log design system status
  console.log('🎯 Design System Status:', getDesignSystemStatus());

  // Test FAST components setup (remove this after Phase 1)
  await testFASTComponents();

  // Install global theme switcher for development (remove in production)
  installGlobalThemeSwitcher();

  // First, create a minimal container just for EnvService
  const app = Aurelia.register(
    Registration.singleton(EnvServiceToken, EnvService)
  );

  // Initialize environment service first
  const envService = app.container.get(EnvServiceToken);
  await envService.init();
  logger = app.container.get(ILogger).scopeTo('Main');

  // Register other services with proper interface-to-implementation mapping
  app.register(
    Registration.singleton(TelegramServiceToken, TelegramService),
    Registration.singleton(AssetsConfigServiceToken, AssetsConfigService),
    Registration.singleton(AssetExchangeApiServiceToken, AssetExchangeApiService),
    Registration.singleton(AssetsStoreToken, AssetsStore),
    Registration.singleton(OrdersStoreToken, OrdersStore),
    Registration.singleton(RequestQueueServiceToken, RequestQueueService),
    OrderConfirmationModal,
    AssetList
  )
    .app(App);

  return app.start();
}

startApp().catch(logger.error);

