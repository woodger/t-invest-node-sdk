/**
 * Модуль package config хранит декларативные defaults и общие runtime
 * policies SDK.
 *
 * Здесь допустимы:
 * - человекочитаемые package defaults;
 * - transport safety policy общего gRPC channel;
 * - unary quota policy по generated service и RPC names;
 * - CLI safety policy, общая для package entrypoints;
 *
 * Здесь не должно быть secrets, environment parsing, deployment-specific
 * значений или runtime-преобразований.
 */

import type { PackageConfigDefinition } from './config.types';

export const packageConfig = {
  sdk: {
    /** TLS включен для каждого SDK instance, если consumer не переопределил его. */
    useSsl: true
  },

  grpc: {
    /**
     * SDK фиксирует 4 MiB как собственную transport policy и не зависит от
     * неявного default grpc-js, который может измениться при upgrade.
     */
    maxReceiveMessageLength: 4 * 1024 * 1024
  },

  unaryLimits: {
    /**
     * Fallback 200 запросов в минуту применяется к RPC без более специфичного rule.
     * Шесть list RPC расходуют одну общую квоту 15 запросов в минуту, поэтому
     * перечислены в одной group с единственным значением limit.
     */
    InstrumentsService: {
      default: {
        maxRequests: 200,
        windowMs: 60_000
      },
      groups: {
        'list-methods': {
          limit: {
            maxRequests: 15,
            windowMs: 60_000
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
        maxRequests: 600,
        windowMs: 60_000
      }
    },

    /**
     * Quota resolver не различает запуск и получение отчета по request
     * payload, поэтому оба report RPC консервативно делят общую квоту 5.
     */
    OperationsService: {
      default: {
        maxRequests: 200,
        windowMs: 60_000
      },
      groups: {
        reports: {
          limit: {
            maxRequests: 5,
            windowMs: 60_000
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
        maxRequests: 100,
        windowMs: 60_000
      },
      methods: {
        GetOrders: {
          maxRequests: 200,
          windowMs: 60_000
        },
        PostOrder: {
          maxRequests: 15,
          windowMs: 1_000
        },
        PostOrderAsync: {
          maxRequests: 600,
          windowMs: 60_000
        },
        CancelOrder: {
          maxRequests: 300,
          windowMs: 60_000
        },
        ReplaceOrder: {
          maxRequests: 300,
          windowMs: 60_000
        }
      }
    },

    /**
     * Sandbox имеет отдельную service quota 200 запросов в минуту;
     * production service rules к нему не применяются.
     */
    SandboxService: {
      default: {
        maxRequests: 200,
        windowMs: 60_000
      }
    },

    /**
     * Оба RPC SignalService суммарно используют service quota 100 запросов
     * в минуту.
     */
    SignalService: {
      default: {
        maxRequests: 100,
        windowMs: 60_000
      }
    },

    /**
     * GetStopOrders использует отдельную квоту 60 запросов в минуту;
     * остальные RPC наследуют service fallback 50.
     */
    StopOrdersService: {
      default: {
        maxRequests: 50,
        windowMs: 60_000
      },
      methods: {
        GetStopOrders: {
          maxRequests: 60,
          windowMs: 60_000
        }
      }
    },

    /**
     * Provider учитывает service quota 100 запросов в минуту суммарно по
     * счетам пользователя.
     */
    UsersService: {
      default: {
        maxRequests: 100,
        windowMs: 60_000
      }
    }
  },

  /**
   * Явный `--confirm` защищает CLI-команды с side effects на уровне package;
   * provider API не знает об этом safety flag.
   */
  requireSideEffectConfirmation: true
} as const satisfies PackageConfigDefinition;
