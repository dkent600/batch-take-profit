import Aurelia from 'aurelia';
import { MyApp } from './my-app';
import { AssetList } from './asset-list';

Aurelia
  .register(AssetList)
  .app(MyApp)
  .start();
