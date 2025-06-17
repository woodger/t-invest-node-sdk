export class Throttle {
  readonly limit: number;
  private counter: number;

  constructor(limit: number) {
    this.limit = limit;
    this.counter = limit;

    /***
    * Таймер обновляет счетчик 1 раз в секунду
    */

    setInterval(() => {
      this.counter = limit;
    },
    1e3);
  }

  reduce() {
    return this.counter-- > 0;
  }
}