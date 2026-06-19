import type { Channel, Metadata } from 'nice-grpc';
import type { Throttle } from '../../application/services/unary-throttle.service';
export declare function createSdkClient<T>(service: unknown, channel: Channel, metadata: Metadata, trackLimits: boolean, throttle: Throttle): T;
