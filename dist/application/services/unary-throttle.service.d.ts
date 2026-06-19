export type UnaryLimits = Record<string, number>;
/**
 * Throttle распределяет unary-запросы по времени на основе лимита запросов в минуту.
 * Например, при лимите 200 запросов в минуту минимальный интервал между ними составляет 300 мс.
 */
export declare class Throttle {
    private stamp;
    private unaryLimits;
    constructor(unaryLimits: UnaryLimits);
    reduce(path: string): Promise<void>;
    resolveLimit(path: string): number | undefined;
}
