import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signupdto';
import { LoginDto } from './dto/logindto';

import { AuthenticationGuard } from 'src/guards/authenticationGuard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('signup')
  async signUp(@Body() signupData: SignupDto) {
    return this.authService.signup(signupData);
  }
  @Get('verify/:token')
  async verifyUserEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // @UseGuards(AuthenticationGuard)
  // @Post('complete-profile')
  // async completeProfile(
  //   @Body() profileData: CompleteProfiledto,
  //   @Req() req,
  // ) {
  //   return this.authService.completeProfile(profileData, req.userId);
  // }

  @Post('login')
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
}
