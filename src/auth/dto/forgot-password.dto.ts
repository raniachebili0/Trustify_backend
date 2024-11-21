import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ description: 'The email address used during signup to reset your password ' })
  @IsEmail()
  email: string;
}
