import "./asset-list.css";
interface IAsset {
  name: string;
  exchange: string;
  exchangeName: string;
  percentage: number;
  apiUrl: string;
}

export class AssetList {
  assets: Array<IAsset> = [];

  async binding() {
    // Fetch config.json from the public root
    const response = await fetch('/config.json');
    const config = await response.json();
    const exchanges = (config.batchConfig?.exchanges ?? []);
    const exchangeMap = Object.fromEntries(exchanges.map((e: { name: string; }) => [e.name, e]));
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

    this.assets = ((config as IConfig).batchConfig?.assets ?? []).map((asset: IAssetConfig): IAsset => ({
      name: asset.name,
      exchange: asset.exchange,
      exchangeName: asset.exchange,
      percentage: asset.percentage ?? 15,
      apiUrl: exchangeMap[asset.exchange]?.apiUrl || ''
    }));
  }
}
