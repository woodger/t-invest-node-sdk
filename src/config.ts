/**
 * Модуль package config хранит декларативные defaults и общие runtime
 * policies SDK.
 *
 * Здесь допустимы:
 * - человекочитаемые package defaults;
 * - transport safety policy общего gRPC channel;
 * - unary limit policy по generated service и RPC names;
 * - CLI safety policy, общая для package entrypoints;
 *
 * Здесь не должно быть secrets, environment parsing, deployment-specific
 * значений или runtime-преобразований.
 */

import type { PackageConfigDefinition } from './config.types';

export const packageConfig = {
  grpc: {
    /**
     * SDK фиксирует 4 MiB как собственную transport policy и не зависит от
     * неявного default grpc-js, который может измениться при upgrade.
     */
    maxReceiveMessageLength: 4 * 1024 * 1024
  },

  unaryLimits: {
    /**
     * Локальный fallback 200 применяется к RPC без более специфичного rule.
     * Шесть list RPC расходуют одну общую квоту 15 запросов в минуту, поэтому
     * перечислены в одной group с единственным значением limit.
     */
    InstrumentsService: {
      default: 200,
      groups: {
        'list-methods': {
          limit: 15,
          methods: [
            'Bonds',
            'Shares',
            'Options',
            'Futures',
            'Etfs',
            'GetAssets'
          ]
        }
      }
    },

    /**
     * Fallback 600 запросов в минуту относится только к unary RPC.
     * Stream connections регулируются отдельной provider policy.
     */
    MarketDataService: {
      default: 600
    },

    /**
     * Локальный limiter не различает запуск и получение отчета по request
     * payload, поэтому оба report RPC консервативно делят общую квоту 5.
     */
    OperationsService: {
      default: 200,
      groups: {
        reports: {
          limit: 5,
          methods: [
            'GetBrokerReport',
            'GetDividendsForeignIssuer'
          ]
        }
      }
    },

    /**
     * Method quotas заменяют service fallback 100 для перечисленных RPC.
     * Лимит PostOrder 15 запросов в секунду хранится как 900 в минуту, потому
     * что все значения UnaryLimits используют одну минутную единицу.
     */
    OrdersService: {
      default: 100,
      methods: {
        GetOrders: 200,
        PostOrder: 900,
        PostOrderAsync: 600,
        CancelOrder: 300,
        ReplaceOrder: 300
      }
    },

    /**
     * Sandbox имеет отдельную service quota 200 запросов в минуту;
     * production service rules к нему не применяются.
     */
    SandboxService: {
      default: 200
    },

    /**
     * GetStopOrders использует отдельную квоту 60 запросов в минуту;
     * остальные RPC наследуют service fallback 50.
     */
    StopOrdersService: {
      default: 50,
      methods: {
        GetStopOrders: 60
      }
    },

    /**
     * Provider учитывает service quota 100 запросов в минуту суммарно по
     * счетам пользователя.
     */
    UsersService: {
      default: 100
    }
  },

  /**
   * Явный `--confirm` защищает CLI-команды с side effects на уровне package;
   * provider API не знает об этом safety flag.
   */
  requireSideEffectConfirmation: true
} as const satisfies PackageConfigDefinition;
