"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */
class Throttle {
    // Временная отметка, раньше которой следующий unary-запрос нельзя отправлять.
    stamp = 0;
    unaryLimits;
    constructor(unaryLimits) {
        this.unaryLimits = unaryLimits;
    }
    async reduce(path) {
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
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    resolveLimit(path) {
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
exports.Throttle = Throttle;
