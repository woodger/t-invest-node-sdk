"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Throttle = void 0;
class Throttle {
    timer;
    counter;
    limit;
    constructor(limit) {
        this.limit = limit;
        /***
        * Таймер обновляет счетчик 1 раз в секунду
        */
        this.timer = setInterval(() => {
            this.reset();
        }, 1e3);
        this.reset();
    }
    reset() {
        this.counter = this.limit;
    }
    reduce() {
        return this.counter-- > 0;
    }
}
exports.Throttle = Throttle;
//# sourceMappingURL=throttle.js.map