export const getTenantEndpoint = () => {
  const tenantDomain = process.env.TENANT_DOMAIN ?? '';
  if (tenantDomain.includes('localhost')) {
    return `http://localhost:8000`;
  }

  return `https://www.${tenantDomain}/api`;
};
