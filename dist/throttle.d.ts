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
export declare class Throttle {
    private stamp;
    private unaryLimits;
    constructor(unaryLimits: UnaryLimits);
    reduce(path: string): Promise<void>;
}
