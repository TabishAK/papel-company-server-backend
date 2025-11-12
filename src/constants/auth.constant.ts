export enum TOKEN_TYPES {
  LOGIN = 'LOGIN',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export const SECRET_HEADER_KEY = 'x-api-key';

export enum TOKEN_VALIDITY {
  DEFAULT = '1d',
  RESET_PASSWORD = '1d',
  TENANT_REGISTER = '1d',
  LOGIN = '7d',
}
