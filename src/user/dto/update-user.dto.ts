import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
<<<<<<< HEAD

export class UpdateUserDto extends PartialType(CreateUserDto) {}
=======
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto  {
  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  Companyname?: string;

  @IsString()
  @IsOptional()
  registrationNumb?: string;
}
>>>>>>> origin/sabrina
