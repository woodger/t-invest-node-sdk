/**
 * Модуль CLI-команды `instrument favorite edit`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  EditFavoritesActionType,
  EditFavoritesRequest,
  type EditFavoritesResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseCommaSeparatedStringListOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  assertSideEffectConfirmed,
  sideEffectConfirmationOptionsSchema
} from '../../args/side-effect-args';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import { editFavoritesFormats, formatEditFavorites } from './reporter';

type EditFavoritesSdk = {
  instruments: {
    editFavorites(request: EditFavoritesRequest): Promise<EditFavoritesResponse>;
  };
  close(): void;
};

type EditFavoritesSdkFactory = (options: TInvestOptions) => EditFavoritesSdk;

const editFavoritesCommandPath = ['instrument', 'favorite', 'edit'] as const;
const defaultEditFavoritesSdkFactory: EditFavoritesSdkFactory = (options) => new TInvestNodeSDK(options);

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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.editFavorites(request);

    return formatEditFavorites(response, format);
  });
}

export function createEditFavoritesRequest(
  options: EditFavoritesRequestOptions
): EditFavoritesRequest {
  return EditFavoritesRequest.create({
    instruments: parseCommaSeparatedStringListOption(
      resolveInstrumentIdOption(options),
      'instrument-id'
    ).map((instrumentId) => ({
      instrumentId
    })),
    actionType: editFavoriteActions[options.action]
  });
}
