export declare class Throttle {
    private timer;
    private counter;
    limit: number;
    constructor(limit: number);
    reset(): void;
    reduce(): boolean;
}
