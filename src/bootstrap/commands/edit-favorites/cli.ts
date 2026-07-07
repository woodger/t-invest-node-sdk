/**
 * Модуль CLI-команды `instrument edit-favorites`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  EditFavoritesActionType,
  type EditFavoritesRequest,
  type EditFavoritesResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import {
  editFavoritesFormats,
  formatEditFavorites,
  type EditFavoritesFormat
} from './reporter';

type EditFavoritesSdk = {
  instruments: {
    editFavorites(request: EditFavoritesRequest): Promise<EditFavoritesResponse>;
  };
  close(): void;
};

type EditFavoritesSdkFactory = (options: TinkoffInvestOptions) => EditFavoritesSdk;

const editFavoritesCommandPath = ['instrument', 'edit-favorites'] as const;
const defaultEditFavoritesSdkFactory: EditFavoritesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const editFavoriteActions = {
  add: EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_ADD,
  del: EditFavoritesActionType.EDIT_FAVORITES_ACTION_TYPE_DEL
} as const;

type EditFavoritesActionName = keyof typeof editFavoriteActions;

const editFavoriteActionNames = Object.keys(editFavoriteActions) as EditFavoritesActionName[];

const editFavoritesRequestOptionsSchema = {
  ...instrumentIdWithDeprecatedFigiOptionsSchema,
  action: {
    type: 'string',
    choices: editFavoriteActionNames,
    required: true
  }
} as const;

const editFavoritesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: editFavoritesFormats,
    default: 'table'
  }
} as const;

const editFavoritesOptionsSchema = withSdkOptions(
  editFavoritesRequestOptionsSchema,
  sideEffectConfirmationOptionsSchema,
  editFavoritesFormatOptionsSchema
);

type EditFavoritesOptions = InferOptions<typeof editFavoritesOptionsSchema>;
type EditFavoritesRequestOptions = CommandRequestOptions<
  EditFavoritesOptions,
  'instrument-id' | 'figi' | 'action'
>;

export function parseEditFavoritesFormat(rawOptions: CommandRawOptions): EditFavoritesFormat {
  return parseCommandOptions(rawOptions, editFavoritesFormatOptionsSchema).format;
}

export function createEditFavoritesCommand(
  createSdk: EditFavoritesSdkFactory = defaultEditFavoritesSdkFactory
) {
  return command.define({
    path: editFavoritesCommandPath,
    options: editFavoritesOptionsSchema,
    handle({ options }) {
      return runEditFavoritesCommand(options, createSdk);
    }
  });
}

export const editFavoritesCommand = createEditFavoritesCommand();

async function runEditFavoritesCommand(
  options: EditFavoritesOptions,
  createSdk: EditFavoritesSdkFactory
): Promise<string> {
  assertSideEffectConfirmed(options.confirm);

  const request = createEditFavoritesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.editFavorites(request);

    return formatEditFavorites(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatEditFavorites };

export function createEditFavoritesRequest(
  options: EditFavoritesRequestOptions
): EditFavoritesRequest {
  return {
    instruments: parseCommaSeparatedStringListOption(
      resolveInstrumentIdOption(options),
      'instrument-id'
    ).map((figi) => ({
      figi
    })),
    actionType: editFavoriteActions[options.action]
  };
}
