const grpcServicePathPrefix = '/tinkoff.public.invest.api.contract.v1.';

export function unaryMethodPath(service: string, method: string): string {
  return `${grpcServicePathPrefix}${service}/${method}`;
}
