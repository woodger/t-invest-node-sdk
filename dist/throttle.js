"use strict";
/***
 * 1. Определени количества миллисекунд в минуте:
 * В одной минуте 60 секунд, а в одной секунде 1000 миллисекунд.
 * Таким образом, в одной минуте 60 * 1000 = 60000 миллисекунд.
 *
 * Рассчет интервала для одной операции:
 * Если лимит в 200 операций в минуту, то интервал времени
 * для одной операции будет равен: 60000 мс / 200 операций = 300 мс
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
class Throttle {
    stamp = 0;
    unaryLimits;
    constructor(unaryLimits) {
        this.unaryLimits = unaryLimits;
    }
    async reduce(path) {
        const time = new Date().getTime();
        const delay = this.stamp - time;
        let limit;
        for (const key in this.unaryLimits) {
            if (path.indexOf(key) > -1) {
                limit = this.unaryLimits[key];
            }
        }
        if (limit === undefined) {
            throw new Error(`Unhandled unary limits for ${path}`);
        }
        this.stamp = time + Math.ceil(6e4 / limit);
        if (delay < 0) {
            return;
        }
        this.stamp += delay;
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
}
exports.Throttle = Throttle;
