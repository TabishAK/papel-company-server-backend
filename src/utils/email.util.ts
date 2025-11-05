export function generateOtpEmailBody(otp: number): string {
  return `
          <html>
            <body>
              <h2>Alymenta One-Time Password Reset</h2>
              <p>We received a request to reset your password. To proceed, please use the One-Time Password (OTP) provided below:</p>
              <h3>Your OTP code: <b>${otp}</b></h3>
              <p>This code is valid for a limited time. If you did not request a password reset, please disregard this email. Your account is secure.</p>
              <br />
              <p>Thank you!</p>
            </body>
          </html>
        `;
}

export function generateOtpEmailVerificationBody(otp: string): string {
  return `
        <html>
          <body>
            <h2>Alymenta Email Verification</h2>
            <p>Hello,</p>
            <p>Thank you for joining Alymenta! To complete your registration, please verify your email address by entering the following One-Time Password (OTP):</p>
            <h3>Your OTP Code: <b>${otp}</b></h3>
            <p>This code is valid for a limited time. If you did not sign up for Alymenta, please ignore this email.</p>
            <br />
            <p>Welcome aboard!</p>
            <p><b>The Alymenta Team</b></p>
          </body>
        </html>
      `;
}
