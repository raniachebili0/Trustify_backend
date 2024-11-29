import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SignupResponseDto } from '../user/dto/signupdto';
import { LoginDto } from '../user/dto/logindto';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-tokens.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggingInterceptor } from 'Interceptor/LoggingInterceptor';

@ApiTags('Authentifiaction Section')
@ApiBearerAuth()
@Controller('auth')
@UseInterceptors(LoggingInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'To create an account ' })
  @ApiResponse({
    status: 201,
    description: 'account created ',
    type: SignupResponseDto,
  })
  @Post('signup')
  async signUp(@Body() signupData: SignupDto) {
    await this.authService.signup(signupData);
    return { message: 'Signup successful. Please verify your email.' };
  }
  @Get('verify/:token')
  async verifyUserEmail(@Param('token') token: string) {
    const result = await this.authService.verifyEmail(token);
    return {
      message: result
        ? 'Email verification successful. You can now log in.'
        : 'Verification failed. Invalid or expired token.',
    };
  }

  // @UseGuards(AuthenticationGuard)
  // @Post('complete-profile')
  // async completeProfile(
  //   @Body() profileData: CompleteProfiledto,
  //   @Req() req,
  // ) {
  //   return this.authService.completeProfile(profileData, req.userId);
  // }
  //validation
  @Get('reset-password')
  async validateResetToken(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    // Validate the token (logic inside your service)
    const isValid = await this.authService.validateResetToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return { message: 'Token is valid', token };
  }
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );
    return { message: 'Tokens refreshed successfully.', tokens };
  }
  @ApiOperation({ summary: 'Used to change your password ' })
  @UseGuards(AuthenticationGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    await this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return { message: 'Password changed successfully.' };
  }
  @ApiOperation({
    summary: 'Used when user forget password and send an reset email  ',
  })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    this.authService.forgotPassword(forgotPasswordDto.email);
  }
  @ApiOperation({ summary: 'reset the password after reset link ' })
  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    try {
      await this.authService.resetPassword(
        resetPasswordDto.newPassword,
        resetPasswordDto.resetToken,
      );

      // Return a success message
      return { message: 'Your password has been successfully reset.' };
    } catch (error) {
      // Handle errors (e.g., invalid or expired token)
      throw new UnauthorizedException(
        'Invalid or expired reset token. Please request a new password reset.',
      );
    }
  }
  @ApiOperation({ summary: 'To login in the  account ' })
  @Post('login')
  async login(@Body() credentials: LoginDto) {
    console.log('login');
    const tokens = await this.authService.login(credentials);
    return { message: 'Login successful.', tokens };
  }
}
