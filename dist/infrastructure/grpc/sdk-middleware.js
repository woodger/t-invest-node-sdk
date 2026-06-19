"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdkMiddleware = createSdkMiddleware;
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
