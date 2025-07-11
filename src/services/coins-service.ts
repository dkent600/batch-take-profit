export class Coin {
  name: string = '';
  pair: string = '';
  amount: number = 0;
  price: number = 0;
  get totalvalue(): number {
    return this.amount * this.price;
  }
}

export class CoinsService {
}