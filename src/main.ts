import { Aurelia, ILogger, Registration, AppTask, IContainer, IAttrMapper, NodeObserverLocator } from 'aurelia';
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
import { installGlobalThemeSwitcher } from './theme-switcher.js';
// Remove custom FAST components - using standard FAST components with Aurelia integration
// import { registerCustomComponents } from './components/index.js';
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

  console.log('✅ MS FAST components registered successfully');

  // Remove custom FAST components - using standard FAST components with Aurelia integration
  // registerCustomComponents();

  // Initialize design system (default or custom based on config)
  await initializeDesignSystem();

  // Log design system status
  console.log('🎯 Design System Status:', getDesignSystemStatus());

  // Install global theme switcher for development (remove in production)
  installGlobalThemeSwitcher();

  // First, create a minimal container just for EnvService
  const app = Aurelia.register(
    Registration.singleton(EnvServiceToken, EnvService),
    // Configure Aurelia to work with MS FAST components
    AppTask.creating(IContainer, container => {
      const attrMapper = container.get(IAttrMapper);
      const nodeObserverLocator = container.get(NodeObserverLocator);

      // Teach Aurelia how to handle two-way binding for FAST components
      attrMapper.useTwoWay((el, property) => {
        switch (el.tagName) {
          case 'FAST-SLIDER':
          case 'FAST-TEXT-FIELD':
          case 'FAST-TEXT-AREA':
            return property === 'value';
          case 'FAST-CHECKBOX':
          case 'FAST-RADIO':
          case 'FAST-RADIO-GROUP':
          case 'FAST-SWITCH':
            return property === 'checked';
          case 'FAST-TABS':
            return property === 'activeid';
          case 'FAST-SELECT':
            return property === 'value';
          default:
            return false;
        }
      });

      // Teach Aurelia what events to use to observe properties of elements
      const valuePropertyConfig = { events: ['input', 'change'] };
      nodeObserverLocator.useConfig({
        'FAST-CHECKBOX': {
          checked: valuePropertyConfig
        },
        'FAST-RADIO': {
          checked: valuePropertyConfig
        },
        'FAST-RADIO-GROUP': {
          value: valuePropertyConfig
        },
        'FAST-SLIDER': {
          value: valuePropertyConfig
        },
        'FAST-SWITCH': {
          checked: valuePropertyConfig
        },
        'FAST-TABS': {
          activeid: valuePropertyConfig
        },
        'FAST-TEXT-FIELD': {
          value: valuePropertyConfig
        },
        'FAST-TEXT-AREA': {
          value: valuePropertyConfig
        },
        'FAST-SELECT': {
          value: valuePropertyConfig
        }
      });

      console.log('✅ Using Aurelia 2 + MS FAST standard integration');
    })
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

startApp().catch(console.error);

