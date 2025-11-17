import { LogInDto } from './dto/signin.dto';
import { AuthService } from './auth.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto, ResetPasswordDto, UserEmailDto } from './dto/forgot-password.dto';
import { AuthenticatedGuard } from 'src/guards/auth.guard';
import { AuthenticatedRequest } from 'src/types/request';
import { VerifyOtpDto } from './dto/otp.dto';

@Controller('/auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/test')
  test() {
    return 'Hello World';
  }

  @Post('/login')
  @ApiOperation({ summary: 'Login a Employee' })
  login(@Body() loginDto: LogInDto) {
    return this.authService.login(loginDto);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('/change-password')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: AuthenticatedRequest) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('/me')
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get current user' })
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.id);
  }

  @Post('/forgot-password')
  @ApiOperation({ summary: 'Initiate forgot password flow' })
  forgotPassword(@Body() forgotPasswordDto: UserEmailDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('/verify-forgot-password-otp')
  @ApiOperation({ summary: 'Verify OTP for forgot password' })
  verifyForgotPasswordOtp(@Body() verifyForgotPasswordDto: VerifyOtpDto) {
    return this.authService.verifyForgotPasswordOtp(verifyForgotPasswordDto);
  }

  @Get('get-company-info')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get company info' })
  getCompanyInfo(@Req() req: AuthenticatedRequest) {
    return this.authService.getCompanyInfo();
  }
}
