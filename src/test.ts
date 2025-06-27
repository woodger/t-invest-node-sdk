import { TinkoffInvestNodeSDK, CandleInterval } from './tinkoff-invest-node-sdk';

(async function (){
  const tinkoffInvestNodeSDK = new TinkoffInvestNodeSDK({
    token: 't.mock_access_token'
  });

  const accounts = await tinkoffInvestNodeSDK.users.getAccounts({});

  const { candles } = await tinkoffInvestNodeSDK.marketdata.getCandles({
    instrumentId: 'BBG004730RP0',
    from: new Date('2022-04-04T11:00:00Z'),
    to: new Date('2022-04-04T11:20:59Z'),
    interval: CandleInterval.CANDLE_INTERVAL_15_MIN
  });

  console.log(accounts, candles);
})();