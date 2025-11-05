export enum TENANT_ERRORS {
  TENANT_NOT_FOUND = 'Tenant not found.',
  DUPLICATE_EMAIL = 'Tenant admin with same email already exist.',
  TENANT_NOT_PAID = 'Tenant does not have a paid subscription',
  TENANT_NOT_VERIFIED = 'Tenant is not verified',
  TENANT_SUBSCRIPTION_PLAN_NOT_UPDATED = 'Tenant subscription plan not updated',
  INVALID_TENANT_CREDENTIALS = 'Invalid tenant ID or API key.',
  MISSING_TENANT_CREDENTIALS = 'Tenant ID and API key are required in headers.',
}

export enum TENANT_SUCCESS {
  TENANT_INFO_ADDED = 'Tenant information added successfully.',
  TENANT_SUBSCRIPTION_ADDED = 'Tenant subscription added successfully.',
  TENANT_IS_VERIFIED = 'Tenant is verified.',
  TENANT_SUBSCRIPTION_PLAN_UPDATED = 'Tenant subscription plan updated successfully.',
  TENANT_PAID = 'Tenant has a paid subscription.',
}
