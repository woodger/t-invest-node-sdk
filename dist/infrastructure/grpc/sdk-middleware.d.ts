import type { CallOptions, ClientMiddlewareCall } from 'nice-grpc';
import type { Throttle } from '../../application/services/unary-throttle.service';
export declare function createSdkMiddleware(trackLimits: boolean, throttle: Throttle): <Request, Response>(call: ClientMiddlewareCall<Request, Response, CallOptions>, options: CallOptions) => AsyncGenerator<Awaited<Response>, Awaited<Response> | undefined, undefined>;
