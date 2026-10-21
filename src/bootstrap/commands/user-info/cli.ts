/**
 * Модуль CLI-команды `account info`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetInfoResponse } from '../../../generated/users';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatUserInfo, userInfoFormats } from './reporter';

type UserInfoSdk = {
  users: {
    getInfo(request: Record<string, never>): Promise<GetInfoResponse>;
  };
  close(): void;
};

type UserInfoSdkFactory = (options: TInvestOptions) => UserInfoSdk;

export function createUserInfoCommand(
  createSdk: UserInfoSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['account', 'info'] as const,
    options: withSdkOptions({
      format: {
        type: 'string',
        choices: userInfoFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.users.getInfo({});

        return formatUserInfo(response, format);
      });
    }
  });
}

export const userInfoCommand = createUserInfoCommand();
