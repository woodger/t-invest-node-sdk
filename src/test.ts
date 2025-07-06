import { TinkoffInvestNodeSDK } from '.';

(async () => {
  const tinkoffInvest = new TinkoffInvestNodeSDK({
    token: 't.5845858',
    endpoint: 'localhost'
  });

  const res = await tinkoffInvest.users.getAccounts({});

  console.log(res);
})();