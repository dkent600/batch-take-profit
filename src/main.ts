import Aurelia from 'aurelia';
import { App } from './app';
import { AssetList } from './asset-list';

Aurelia
  .register(AssetList)
  .app(App)
  .start();
