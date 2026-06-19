"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSdkMetadata = createSdkMetadata;
const nice_grpc_1 = require("nice-grpc");
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
