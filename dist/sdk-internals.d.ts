import { CallOptions, Channel, ClientMiddlewareCall, Metadata } from 'nice-grpc';
import { Throttle } from './throttle';
import type { TinkoffInvestOptions } from './tinkoff-invest-node-sdk';
export declare function createSdkChannel(options: TinkoffInvestOptions): Channel;
export declare function createSdkMetadata(options: TinkoffInvestOptions): Metadata;
export declare function createSdkMiddleware(trackLimits: boolean, throttle: Throttle): <Request, Response>(call: ClientMiddlewareCall<Request, Response, CallOptions>, options: CallOptions) => AsyncGenerator<Awaited<Response>, Awaited<Response> | undefined, undefined>;
export declare function createSdkClient<T>(service: unknown, channel: Channel, metadata: Metadata, trackLimits: boolean, throttle: Throttle): T;
