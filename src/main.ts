import { Aurelia, ILogger, Registration } from 'aurelia';
import { App } from './pages/app/app.js';
import { AssetList } from './pages/asset-list/asset-list.js';

import { DialogConfiguration } from '@aurelia/dialog';
import { FluentDialogRenderer } from './dialogs/fluent-dialog-renderers/fluent-dialog-renderer.js';
import { FluentUIAdapter } from './stores/fluent-ui-adapter.js';

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
  fluentDialog,
  fluentProgressRing
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
import { DataGrid } from './components/ui/data-grid/data-grid.js';
import { IconButton } from './components/ui/icon-button/icon-button.js';

let logger: ILogger;

async function startApp() {

  try {
    // Initialize environment service first
    const app = Aurelia.register(Registration.singleton(EnvServiceToken, EnvService));

    const envService = app.container.get(EnvServiceToken);
    await envService.init();
    logger = app.container.get(ILogger).scopeTo('Main');

    // Register Fluent UI components - simplified approach from fluent-test
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
        fluentDialog(),
        fluentProgressRing()
      );

    console.info('✅ Fluent UI components registered successfully');

    app.register(
      // Configure FluentUIAdapter for two-way binding
      FluentUIAdapter.customize({ withPrefix: 'fluent' }),

      DialogConfiguration.customize(settings => {
        settings.renderer = FluentDialogRenderer; // <-- aurelia dialog fluentui custom renderer
        settings.rejectOnCancel = true;           // optional preference
      }),

      Registration.singleton(TelegramServiceToken, TelegramService),
      Registration.singleton(AssetsConfigServiceToken, AssetsConfigService),
      Registration.singleton(AssetExchangeApiServiceToken, AssetExchangeApiService),
      Registration.singleton(AssetsStoreToken, AssetsStore),
      Registration.singleton(OrdersStoreToken, OrdersStore),
      Registration.singleton(RequestQueueServiceToken, RequestQueueService),
      // Components
      AssetList,
      IconButton,
      DataGrid)
      .app(App);

    return app.start();
  }
  catch (error) { logger ? logger.error(error) : console.error(error) };
}

startApp();

