export declare class Throttle {
    readonly limit: number;
    private counter;
    constructor(limit: number);
    reduce(): boolean;
}
