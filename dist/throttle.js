"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
class Throttle {
    limit;
    counter;
    constructor(limit) {
        this.limit = limit;
        this.counter = limit;
        /***
        * Таймер обновляет счетчик 1 раз в секунду
        */
        setInterval(() => {
            this.counter = limit;
        }, 1e3);
    }
    reduce() {
        return this.counter-- > 0;
    }
}
exports.Throttle = Throttle;
//# sourceMappingURL=throttle.js.map