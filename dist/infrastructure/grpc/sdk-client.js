"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdkClient = createSdkClient;
const nice_grpc_1 = require("nice-grpc");
const sdk_middleware_1 = require("./sdk-middleware");
// Собирает gRPC-клиент сервиса с общими middleware и metadata SDK.
function createSdkClient(service, channel, metadata, trackLimits, throttle) {
    return (0, nice_grpc_1.createClientFactory)()
        .use((0, sdk_middleware_1.createSdkMiddleware)(trackLimits, throttle))
        .create(service, channel, {
        '*': {
            metadata
        }
    });
}
