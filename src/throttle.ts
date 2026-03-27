import { UnaryLimits } from './config';

/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */

export class Throttle {
  // Временная отметка, раньше которой следующий unary-запрос нельзя отправлять.
  private stamp = 0;
  private unaryLimits: UnaryLimits;

  constructor(unaryLimits: UnaryLimits) {
    this.unaryLimits = unaryLimits;
  }

  async reduce(path: string) {
    const time = new Date().getTime();
    const delay = this.stamp - time;
    const limit = this.resolveLimit(path);

    if (limit === undefined) {
      throw new Error(`Unhandled unary limits for ${path}`);
    }

    // Преобразуем лимит "запросов в минуту" в минимальный интервал между запросами.
    this.stamp = time + Math.ceil(6e4 / limit);

    if (delay < 0) {
      return;
    }

    // Если уже есть накопленная задержка, сдвигаем окно отправки дальше.
    this.stamp += delay;

    await new Promise((resolve) => 
      setTimeout(resolve, delay)
    );
  }

  resolveLimit(path: string) {
    let limit;
    let matchLength = -1;

    for (const key in this.unaryLimits) {
      // Для пересекающихся маршрутов выбираем самое специфичное совпадение.
      if (path.indexOf(key) > -1 && key.length > matchLength) {
        limit = this.unaryLimits[key];
        matchLength = key.length;
      }
    }

    return limit;
  }
}
