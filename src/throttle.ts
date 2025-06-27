/***
 * 1. Определени количества миллисекунд в минуте: 
 * В одной минуте 60 секунд, а в одной секунде 1000 миллисекунд.
 * Таким образом, в одной минуте 60 * 1000 = 60000 миллисекунд.
 *
 * Рассчет интервала для одной операции:
 * Если лимит в 200 операций в минуту, то интервал времени 
 * для одной операции будет равен: 60000 мс / 200 операций = 300 мс
 */

export interface UnaryLimits {
  [propName: string]: number;
}

export class Throttle {
  private timestamp = 0;
  private unaryLimits: UnaryLimits;

  constructor(unaryLimits: UnaryLimits) {
    this.unaryLimits = unaryLimits;
  }

  async reduce(path: string) {
    const now = new Date().getTime();
    const delay = this.timestamp - now;

    if (delay > 0) {
      await new Promise((resolve) => 
        setTimeout(resolve, delay)
      );
    }

    let ops = 50;

    for (const key in this.unaryLimits) {
      if (path.indexOf(key) > -1) {
        ops = this.unaryLimits[key];
      }
    }
    
    if (!ops) {
      throw new Error('Unhandled unary limits');
    }

    this.timestamp = Math.ceil(6e4 / ops) + now + delay;
  }
}