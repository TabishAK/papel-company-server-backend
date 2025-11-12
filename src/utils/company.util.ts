import { SECRET_HEADER_KEY } from 'src/constants/auth.constant';

export const getCompanySecretKeyHeader = (): Record<string, string> => {
  return { [SECRET_HEADER_KEY]: process.env.COMPANY_API_KEY || '' };
};
