"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const tinkoff_invest_node_sdk_1 = require("./tinkoff-invest-node-sdk");
const data_source_json_1 = __importDefault(require("./data-source.json"));
class TinkoffInvestService {
    tinkoffInvest;
    constructor() {
        dotenv_1.default.config();
        this.tinkoffInvest = new tinkoff_invest_node_sdk_1.TinkoffInvestNodeSDK({
            token: process.env.TINKOFF_INVEST_API_TOKEN
        });
    }
    /**
     * Получения счетов пользователя
     */
    async getAccounts() {
        return await this.tinkoffInvest.users.getAccounts({});
    }
    /**
     * Получение информаци об инструментах
     */
    async initialAll() {
        let count = 0;
        for (let figi of data_source_json_1.default.figiList) {
            let instrument;
            try {
                let res = await this.tinkoffInvest.instruments.getInstrumentBy({
                    idType: tinkoff_invest_node_sdk_1.InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
                    id: figi
                });
                instrument = res.instrument;
            }
            catch (err) {
                console.log(`Instrument '${figi}' not found; needs to be excluded`);
                continue;
            }
            count++;
        }
        return count;
    }
}
(async function () {
    const tinkoffInvestService = new TinkoffInvestService();
    const count = await tinkoffInvestService.initialAll();
    console.log(`Received ${count} instruments`);
})();
//# sourceMappingURL=test.js.map