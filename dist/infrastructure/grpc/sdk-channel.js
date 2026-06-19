"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdkChannel = createSdkChannel;
const nice_grpc_1 = require("nice-grpc");
// Создает канал с TLS или insecure credentials в зависимости от настроек SDK.
function createSdkChannel(options) {
    const credentials = options.useSsl
        ? nice_grpc_1.ChannelCredentials.createSsl()
        : nice_grpc_1.ChannelCredentials.createInsecure();
    return (0, nice_grpc_1.createChannel)(options.endpoint, credentials);
}
