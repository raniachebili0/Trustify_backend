import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The token used to verify the password reset request.' })
  @IsString()
  resetToken: string;
  @ApiProperty({ 
    description: 'The new password to be set. It must be at least 6 characters long and contain at least one number.' 
  })
  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  newPassword: string;
}
