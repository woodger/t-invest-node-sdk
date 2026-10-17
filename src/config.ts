/**
 * Модуль хранит значения по умолчанию и правила работы SDK.
 *
 * Здесь допустимы:
 * - значения по умолчанию модуля;
 * - правила настройки общего gRPC-канала;
 * - квоты unary-вызовов по сервисам и RPC;
 * - правило подтверждения CLI-команд с побочными эффектами.
 *
 * Здесь не должно быть секретов, чтения окружения, значений развёртывания или
 * преобразований при создании SDK.
 */

import type { PackageConfigDefinition } from './config.types';

const maxReceiveMessageLengthBytes = 4_194_304;
const minuteWindowMs = 60_000;
const secondWindowMs = 1_000;

const instrumentsDefaultRequestsPerMinute = 200;
const instrumentsListRequestsPerMinute = 15;
const marketDataUnaryRequestsPerMinute = 600;
const operationsDefaultRequestsPerMinute = 200;
const operationsReportRequestsPerMinute = 5;
const ordersDefaultRequestsPerMinute = 100;
const ordersGetOrdersRequestsPerMinute = 200;
const ordersPostOrderRequestsPerSecond = 15;
const ordersPostOrderAsyncRequestsPerMinute = 600;
const ordersCancelOrderRequestsPerMinute = 300;
const ordersReplaceOrderRequestsPerMinute = 300;
const sandboxRequestsPerMinute = 200;
const signalsRequestsPerMinute = 100;
const stopOrdersDefaultRequestsPerMinute = 50;
const getStopOrdersRequestsPerMinute = 60;
const usersRequestsPerMinute = 100;

export const packageConfig = {
  sdk: {
    /**
     * TLS включён, если приложение не передало `useSsl` для экземпляра SDK.
     */
    useSsl: true
  },

  grpc: {
    /**
     * SDK фиксирует 4 MiB как собственную transport policy и не зависит от
     * неявного default grpc-js, который может измениться при upgrade.
     */
    maxReceiveMessageLength: maxReceiveMessageLengthBytes
  },

  unaryLimits: {
    /**
     * Fallback 200 запросов в минуту применяется к RPC без более специфичного
     * rule.
     * Шесть list RPC расходуют одну общую квоту 15 запросов в минуту, поэтому
     * перечислены в одной group с единственным значением limit.
     */
    InstrumentsService: {
      default: {
        maxRequests: instrumentsDefaultRequestsPerMinute,
        windowMs: minuteWindowMs
      },
      groups: {
        'list-methods': {
          limit: {
            maxRequests: instrumentsListRequestsPerMinute,
            windowMs: minuteWindowMs
          },
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
      default: {
        maxRequests: marketDataUnaryRequestsPerMinute,
        windowMs: minuteWindowMs
      }
    },

    /**
     * Quota resolver не различает запуск и получение отчета по request
     * payload, поэтому оба report RPC консервативно делят общую квоту 5.
     */
    OperationsService: {
      default: {
        maxRequests: operationsDefaultRequestsPerMinute,
        windowMs: minuteWindowMs
      },
      groups: {
        reports: {
          limit: {
            maxRequests: operationsReportRequestsPerMinute,
            windowMs: minuteWindowMs
          },
          methods: [
            'GetBrokerReport',
            'GetDividendsForeignIssuer'
          ]
        }
      }
    },

    /**
     * Method quotas заменяют service fallback 100 для перечисленных RPC.
     * Исходное секундное окно PostOrder сохраняется без нормализации в минуту.
     */
    OrdersService: {
      default: {
        maxRequests: ordersDefaultRequestsPerMinute,
        windowMs: minuteWindowMs
      },
      methods: {
        GetOrders: {
          maxRequests: ordersGetOrdersRequestsPerMinute,
          windowMs: minuteWindowMs
        },
        PostOrder: {
          maxRequests: ordersPostOrderRequestsPerSecond,
          windowMs: secondWindowMs
        },
        PostOrderAsync: {
          maxRequests: ordersPostOrderAsyncRequestsPerMinute,
          windowMs: minuteWindowMs
        },
        CancelOrder: {
          maxRequests: ordersCancelOrderRequestsPerMinute,
          windowMs: minuteWindowMs
        },
        ReplaceOrder: {
          maxRequests: ordersReplaceOrderRequestsPerMinute,
          windowMs: minuteWindowMs
        }
      }
    },

    /**
     * Sandbox имеет отдельную service quota 200 запросов в минуту;
     * production service rules к нему не применяются.
     */
    SandboxService: {
      default: {
        maxRequests: sandboxRequestsPerMinute,
        windowMs: minuteWindowMs
      }
    },

    /**
     * Оба RPC SignalService суммарно используют service quota 100 запросов
     * в минуту.
     */
    SignalService: {
      default: {
        maxRequests: signalsRequestsPerMinute,
        windowMs: minuteWindowMs
      }
    },

    /**
     * GetStopOrders использует отдельную квоту 60 запросов в минуту;
     * остальные RPC наследуют service fallback 50.
     */
    StopOrdersService: {
      default: {
        maxRequests: stopOrdersDefaultRequestsPerMinute,
        windowMs: minuteWindowMs
      },
      methods: {
        GetStopOrders: {
          maxRequests: getStopOrdersRequestsPerMinute,
          windowMs: minuteWindowMs
        }
      }
    },

    /**
     * Provider учитывает service quota 100 запросов в минуту суммарно по
     * счетам пользователя.
     */
    UsersService: {
      default: {
        maxRequests: usersRequestsPerMinute,
        windowMs: minuteWindowMs
      }
    }
  },

  /**
   * Явный `--confirm` защищает CLI-команды с side effects на уровне package;
   * provider API не знает об этом safety flag.
   */
  requireSideEffectConfirmation: true
} as const satisfies PackageConfigDefinition;
