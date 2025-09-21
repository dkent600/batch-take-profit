import { Aurelia, ILogger, Registration, AppTask, IContainer, IAttrMapper, NodeObserverLocator } from 'aurelia';
import { App } from './pages/app/app.js';
import './pages/app/app.css';
import { AssetList } from './pages/asset-list/asset-list.js';

// Import Fluent UI components
import {
  provideFluentDesignSystem,
  fluentButton,
  fluentCheckbox,
  fluentTextField,
  fluentSelect,
  fluentOption,
  fluentAnchor,
  fluentDataGrid,
  fluentDataGridRow,
  fluentDataGridCell,
  fluentDesignSystemProvider,
  fluentAccordion,
  fluentAccordionItem,
  fluentDialog
} from '@fluentui/web-components';

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
import { OrderConfirmationModal, OrderConfirmationModalToken } from './pages/asset-list/order-confirmation-modal.js';
import { DataGrid } from './components/ui/data-grid.js';

let logger: ILogger;

async function startApp() {

  try {
    // Initialize environment service first
    const app = Aurelia.register(Registration.singleton(EnvServiceToken, EnvService));

    const envService = app.container.get(EnvServiceToken);
    await envService.init();
    logger = app.container.get(ILogger).scopeTo('Main');

    // Register Fluent UI components
    provideFluentDesignSystem()
      .register(
        fluentDesignSystemProvider(),
        fluentButton(),
        fluentCheckbox(),
        fluentTextField(),
        fluentSelect(),
        fluentOption(),
        fluentAnchor(),
        fluentDataGrid(),
        fluentDataGridRow(),
        fluentDataGridCell(),
        fluentAccordion(),
        fluentAccordionItem(),
        fluentDialog()
      );

    console.info('✅ Fluent UI components registered successfully');

    // Register other services with proper interface-to-implementation mapping
    app.register(
      // Configure Aurelia 2 + Fluent UI Integration
      AppTask.creating(IContainer, container => {
        // Configure two-way binding for Fluent UI components
        const attrMapper = container.get(IAttrMapper);
        attrMapper.useTwoWay((el, property) => {
          switch (el.tagName) {
            case 'FLUENT-TEXT-FIELD':
            case 'FLUENT-TEXT-AREA':
              return property === 'value';
            case 'FLUENT-CHECKBOX':
            case 'FLUENT-SWITCH':
              return property === 'checked';
            case 'FLUENT-SELECT':
              return property === 'value';
            default:
              return false;
          }
        });

        // Configure event observation for Fluent UI components
        const nodeObserverLocator = container.get(NodeObserverLocator);
        const valuePropertyConfig = { events: ['input', 'change'] };
        nodeObserverLocator.useConfig({
          'FLUENT-TEXT-FIELD': {
            value: valuePropertyConfig
          },
          'FLUENT-TEXT-AREA': {
            value: valuePropertyConfig
          },
          'FLUENT-SELECT': {
            value: valuePropertyConfig
          },
          'FLUENT-CHECKBOX': {
            checked: valuePropertyConfig
          },
          'FLUENT-SWITCH': {
            checked: valuePropertyConfig
          }
        });

        console.info('✅ Using Aurelia 2 + Fluent UI integration');
      }),
      Registration.singleton(TelegramServiceToken, TelegramService),
      Registration.singleton(AssetsConfigServiceToken, AssetsConfigService),
      Registration.singleton(AssetExchangeApiServiceToken, AssetExchangeApiService),
      Registration.singleton(AssetsStoreToken, AssetsStore),
      Registration.singleton(OrdersStoreToken, OrdersStore),
      Registration.singleton(RequestQueueServiceToken, RequestQueueService),
      Registration.singleton(OrderConfirmationModalToken, OrderConfirmationModal),
      AssetList,
      DataGrid
    ).app(App);
    return app.start();
  }
  catch (error) { console.error(error) };
}

startApp();

