export enum AUTH_ERRORS {
  INCORRECT_PASSWORD = 'Incorrect password.',
  USER_NOT_FOUND = 'Unable to find the user.',
  DUPLICATE_ORGANIZATION = 'Organization with same email already exist.',
  ACCOUNT_CREATION = 'An error occurred while creating new user.',
  ACCOUNT_LOGIN = 'An error occurred while logging the account.',
  UNAUTHORIZED = 'You are not authorized to access this operation.',
  FORGOT_PASSWORD = 'An error occurred while resetting user password.',
  INVALID_TOKEN = 'Your token is not validate.',
  SIGNIN = 'An error occurred while signing in.',
  EMAIL_NOT_VERIFIED = 'Your email is not verified. Please check your email for verification.',
  RESET_PASSWORD = 'An error occurred while resetting the password.',
  SAME_PASSWORD = 'New password cannot be the same as the old password.',
  ME = 'An error occurred while fetching the user details.',
}

export enum AUTH_SUCCESS {
  ACCOUNT_LOGIN = 'Your account has been logged in successfully.',
  FORGOT_PASSWORD = 'The password reset email has been sent successfully.',
  RESET_PASSWORD = 'The password has been successfully reset.',
  EMAIL_VERIFIED = 'Your email has been verified successfully.',
  SIGNIN = 'You have been successfully signed in.',
  SIGNUP_VERIFICATION = 'OTP verified. You can now set your password.',
  ME = 'User details fetched successfully.',
  REGISTER_SUPER_ADMIN = 'Super admin has been registered successfully.',
  GENERATE_TENANT_API_KEY = 'Tenant API key has been generated successfully.',
}
