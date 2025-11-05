export enum SUBSCRIPTION_ERRORS {
  SUBSCRIPTION_NOT_FOUND = 'Subscription plan not found.',
  SUBSCRIPTION_ALREADY_EXISTS = 'Subscription plan already exists.',
  SUBSCRIPTION_DATA_EXISTS = 'Subscription data already exists. Clear existing data first if you want to reseed.',
  INVALID_SUBSCRIPTION_TYPE = 'Invalid subscription type.',
}

export enum SUBSCRIPTION_SUCCESS {
  SUBSCRIPTION_CREATED = 'Subscription plan created successfully.',
  SUBSCRIPTION_UPDATED = 'Subscription plan updated successfully.',
  SUBSCRIPTION_DELETED = 'Subscription plan deleted successfully.',
  SUBSCRIPTIONS_FETCHED = 'Subscription plans fetched successfully.',
  SUBSCRIPTION_FETCHED = 'Subscription plan fetched successfully.',
  SUBSCRIPTION_DATA_SEEDED = 'Subscription data seeded successfully.',
  SUBSCRIPTION_DATA_CLEARED = 'Subscription data cleared successfully.',
}
