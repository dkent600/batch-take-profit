import "./asset-list.css";
export class AssetList {

  async binding() {
    // Fetch config.json from the public root

  }

  createSellOrder(event: Event, asset: IAsset) {
    console.log('Creating sell order for:', asset.name);
  }
}
