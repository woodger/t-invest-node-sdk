export class Throttle {
  private timer: NodeJS.Timeout;
  private counter: number;

  public limit: number;
  
  constructor(limit: number) {
    this.limit = limit;

    /***
    * Таймер обновляет счетчик 1 раз в секунду
    */

    this.timer = setInterval(() => {
      this.reset();
    },
    1e3);

    this.reset();
  }

  reset() {
    this.counter = this.limit;
  }

  reduce() {
    return this.counter-- > 0;
  }
}