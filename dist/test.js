"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
(async () => {
    const tinkoffInvest = new _1.TinkoffInvestNodeSDK({
        token: 't.5845858',
        endpoint: 'localhost'
    });
    const res = await tinkoffInvest.users.getAccounts({});
    console.log(res);
})();
//# sourceMappingURL=test.js.map