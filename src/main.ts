import { Aurelia, Registration } from 'aurelia';
import { App } from './pages/app/app.js';
import './pages/app/app.css';
import { AssetList } from './pages/asset-list/asset-list.js';
import {
  LogService, LogServiceToken,
  TelegramService, TelegramServiceToken,
  AssetsConfigService, AssetsConfigServiceToken,
  EnvService, EnvServiceToken,
  MexcApiService,
  MexcApiServiceToken
} from './services/index.js';

async function startApp() {
  // First, create a minimal container just for EnvService
  const app = Aurelia.register(
    Registration.singleton(EnvServiceToken, EnvService)
  );

  // Initialize environment service first
  const envService = app.container.get(EnvServiceToken);
  await envService.init();

  // Register other services with proper interface-to-implementation mapping
  app.register(
    Registration.singleton(LogServiceToken, LogService),
    Registration.singleton(TelegramServiceToken, TelegramService),
    Registration.singleton(AssetsConfigServiceToken, AssetsConfigService),
    Registration.singleton(MexcApiServiceToken, MexcApiService),
    AssetList
  )
    .app(App);

  return app.start();
}

startApp().catch(console.error);

