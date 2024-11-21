import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email address used to create your account  ',
  })
  @IsEmail()
  email: string;
  @ApiProperty({ description: 'The password associated with your account' })
  @IsString()
  password: string;
}
