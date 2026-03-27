"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdkChannel = createSdkChannel;
exports.createSdkMetadata = createSdkMetadata;
exports.createSdkMiddleware = createSdkMiddleware;
exports.createSdkClient = createSdkClient;
const nice_grpc_1 = require("nice-grpc");
// Создает канал с TLS или insecure credentials в зависимости от настроек SDK.
function createSdkChannel(options) {
    const credentials = options.useSsl
        ? nice_grpc_1.ChannelCredentials.createSsl()
        : nice_grpc_1.ChannelCredentials.createInsecure();
    return (0, nice_grpc_1.createChannel)(options.endpoint, credentials);
}
// Подготавливает metadata, которая будет отправляться со всеми unary-вызовами.
function createSdkMetadata(options) {
    const init = {
        Authorization: `Bearer ${options.token}`
    };
    if (options.appName) {
        init['x-app-name'] = options.appName;
    }
    return new nice_grpc_1.Metadata(init);
}
// Middleware применяет локальный throttling только к unary-вызовам.
function createSdkMiddleware(trackLimits, throttle) {
    return async function* (call, options) {
        if (!call.responseStream) {
            if (trackLimits) {
                await throttle.reduce(call.method.path);
            }
            const response = yield* call.next(call.request, options);
            return response;
        }
        for await (const response of call.next(call.request, options)) {
            yield response;
        }
    };
}
// Собирает gRPC-клиент сервиса с общими middleware и metadata SDK.
function createSdkClient(service, channel, metadata, trackLimits, throttle) {
    return (0, nice_grpc_1.createClientFactory)()
        .use(createSdkMiddleware(trackLimits, throttle))
        .create(service, channel, {
        '*': {
            metadata
        }
    });
}
