import dotenv from 'dotenv';
import { TinkoffInvestNodeSDK, CandleInterval, InstrumentIdType, Instrument } from './tinkoff-invest-node-sdk';
import dataSource from './data-source.json';

class TinkoffInvestService {
  tinkoffInvest: TinkoffInvestNodeSDK;

  constructor() {
    dotenv.config();

    this.tinkoffInvest = new TinkoffInvestNodeSDK({
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
    
    for (let figi of dataSource.figiList) {
      let instrument: Instrument;

      try {
        let res = await this.tinkoffInvest.instruments.getInstrumentBy({
          idType: InstrumentIdType.INSTRUMENT_ID_TYPE_FIGI,
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

(async function (){
  const tinkoffInvestService = new TinkoffInvestService();
  const count = await tinkoffInvestService.initialAll();

  console.log(`Received ${count} instruments`);
})();