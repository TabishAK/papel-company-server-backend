export enum OTP_ERROR {
  OTP_GENERATION = 'An error occurred while generating otp.',
  VERIFICATION_FAILED = 'OTP verification failed.',
  VERIFY_OTP = 'An error occurred while verifying otp.',
  OTP_EXPIRED = 'OTP has expired.',
  RESEND_OTP = 'An error occurred while resending the OTP.',
}

export enum OTP_SUCCESS {
  OTP_GENERATION = 'OTP has been successfully generated. Please check your email.',
  VERIFIED_OTP = 'Otp successfully verified.',
  OTP_RESENT = 'OTP has been resent successfully.',
}
