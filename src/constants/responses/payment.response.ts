export enum PAYMENT_ERRORS {
  PAYMENT_PLAN_NOT_FOUND = 'Payment plan not found.',
  CUSTOMER_CREATION_FAILED = 'Failed to create or find customer.',
  CHECKOUT_SESSION_CREATION_FAILED = 'Failed to create checkout session.',
  WEBHOOK_SIGNATURE_VERIFICATION_FAILED = 'Webhook signature verification failed.',
  SUBSCRIPTION_NOT_FOUND = 'Subscription not found.',
  CHECKOUT_SESSION_NOT_FOUND = 'Checkout session not found.',
  SUBSCRIPTION_CREATION_FAILED = 'Failed to create subscription record.',
  SUBSCRIPTION_UPDATE_FAILED = 'Failed to update subscription record.',
  ADMIN_SUBSCRIPTION_UPDATE_FAILED = 'Failed to update tenant subscription by admin.',
  SUBSCRIPTION_CHANGE_FAILED = 'Failed to change subscription plan.',
  NO_ACTIVE_SUBSCRIPTION = 'No active subscription found for this tenant.',
  SAME_PLAN_SELECTED = 'The selected plan is the same as your current plan.',
}

export enum PAYMENT_SUCCESS {
  PAYMENT_INTENT_CREATED = 'Payment intent created successfully.',
  CUSTOMER_FOUND = 'Customer found successfully.',
  CUSTOMER_CREATED = 'Customer created successfully.',
  CHECKOUT_SESSION_CREATED = 'Checkout session created successfully.',
  WEBHOOK_PROCESSED = 'Webhook processed successfully.',
  SUBSCRIPTION_CREATED = 'Subscription created successfully.',
  SUBSCRIPTION_UPDATED = 'Subscription updated successfully.',
  SUBSCRIPTION_DELETED = 'Subscription deleted successfully.',
  ADMIN_SUBSCRIPTION_UPDATED = 'Tenant subscription updated successfully by admin.',
  SUBSCRIPTION_CHANGE_SESSION_CREATED = 'Checkout session created for subscription plan change.',
}
